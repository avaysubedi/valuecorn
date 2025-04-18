from flask import Blueprint, request, jsonify
import pyodbc
from flask_jwt_extended import jwt_required, get_jwt_identity

valuations_bp = Blueprint('valuations', __name__)

def get_db():
    return pyodbc.connect(
        'DRIVER={ODBC Driver 17 for SQL Server};'
        'SERVER=LAPTOP-E5EKBDRG;'
        'DATABASE=Valuecorn;'
        'UID=sa;PWD=P@ssw0rd'
    )
@valuations_bp.route('/api/valuations', methods=['POST'])
@jwt_required()
def create_valuation():
    try:
        user_id = 1  # Replace with get_jwt_identity()['id'] when JWT is ready
        data = request.get_json()
        valuation = data['valuation']
        years = data['years']

        conn = get_db()
        cursor = conn.cursor()

        # Step 1: Insert Valuation Header
        cursor.execute("""
            SET NOCOUNT ON;
            DECLARE @NewId INT;
            EXEC InsertValuationData 
                ?, ?, ?, ?, ?, ?, ?, ?, ?, @NewId OUTPUT;
            SELECT @NewId AS ValuationId;
        """, (
            user_id,
            valuation['companyCode'],
            valuation['country'],
            valuation['discountRate'],
            valuation['taxRate'],
            valuation['terminalGrowthRate'],
            valuation['terminalValue'],
            valuation['discountedTerminalValue'],
            valuation['dcfValuation']
        ))

        output_id = cursor.fetchone()
        if not output_id:
            raise Exception("Valuation ID not returned from stored procedure.")
        valuation_id = output_id[0]

        # Step 2: Insert Valuation Years
        for year_data in years:
            cursor.execute("""
                EXEC InsertValuationYear ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            """, (
                valuation_id,
                year_data['year'],
                year_data['isProjected'],
                year_data['revenues'],
                year_data['cogs'],
                year_data['employeeExpense'],
                year_data['sgaExpense'],
                year_data['depreciation'],
                year_data['interestExpense'],
                year_data['otherIncome'],
                year_data['ebitda'],
                year_data['ebit'],
                year_data['nopat'],
                year_data['fcff'],
                year_data['discountedFcff']
            ))

        # Step 3: DCF Calculation Logic
        try:
            total_years = len(years)
            discount_rate = float(valuation['discountRate'])
            tax_rate = float(valuation['taxRate'])
            terminal_growth_rate = float(valuation['terminalGrowthRate'])

            revenues = [float(y['revenues']) for y in years]
            cogs = [float(y['cogs']) for y in years]
            employee_expense = [float(y['employeeExpense']) for y in years]
            sga_expense = [float(y['sgaExpense']) for y in years]
            depreciation = [float(y['depreciation']) for y in years]
            interest_expense = [float(y['interestExpense']) for y in years]
            other_income = [float(y['otherIncome']) for y in years]

            # Calculate cash flows
            ebitda = [revenues[i] - cogs[i] - employee_expense[i] - sga_expense[i] for i in range(total_years)]
            ebit = [ebitda[i] - depreciation[i] for i in range(total_years)]
            nopat = [ebit[i] * (1 - tax_rate) for i in range(total_years)]
            fcff = [nopat[i] + depreciation[i] - interest_expense[i] + other_income[i] for i in range(total_years)]
            discounted_fcff = [fcff[i] / ((1 + discount_rate) ** (i + 1)) for i in range(total_years)]

            # Terminal value
            terminal_value = (fcff[-1] * (1 + terminal_growth_rate)) / (discount_rate - terminal_growth_rate)
            discounted_terminal_value = terminal_value / ((1 + discount_rate) ** total_years)
            dcf_valuation = round(sum(discounted_fcff) + discounted_terminal_value, 2)

            # Step 4: Update valuation summary values
            cursor.execute("""
                UPDATE Valuations 
                SET TerminalValue = ?, 
                    DiscountedTerminalValue = ?, 
                    DCFValuation = ?
                WHERE Id = ?
            """, (terminal_value, discounted_terminal_value, dcf_valuation, valuation_id))

        except Exception as calc_err:
            raise Exception(f"Calculation error: {calc_err}")

        conn.commit()

        # Step 5: Return full result
        return jsonify({
            "message": "Valuation created",
            "valuationId": valuation_id,
            "dcfValuation": dcf_valuation,
            "terminalValue": round(terminal_value, 2),
            "discountedTerminalValue": round(discounted_terminal_value, 2),
            "discountedFcff": [round(x, 2) for x in discounted_fcff]
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
