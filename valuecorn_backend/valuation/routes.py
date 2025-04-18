from flask import Blueprint, request, jsonify
import pyodbc
from flask_jwt_extended import get_jwt, jwt_required, get_jwt_identity

valuations_bp = Blueprint('valuations', __name__)

def get_db():
    return pyodbc.connect(
        'DRIVER={ODBC Driver 17 for SQL Server};'
        'SERVER=localhost\sql19;'
        'DATABASE=Valuecorn;'
        'UID=sa;PWD=P@ssw0rd'
    )
@valuations_bp.route('/api/valuations', methods=['POST'])
@jwt_required()
def create_valuation():
    try:
        user_id = int(get_jwt_identity())
        claims = get_jwt()
        email = claims.get("email")
        role = claims.get("role")
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

        # Step 2: DCF Calculation Logic before insertion
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

        ebitda = [revenues[i] - cogs[i] - employee_expense[i] - sga_expense[i] for i in range(total_years)]
        ebit = [ebitda[i] - depreciation[i] for i in range(total_years)]
        nopat = [ebit[i] * (1 - tax_rate) for i in range(total_years)]
        fcff = [nopat[i] + depreciation[i] - interest_expense[i] + other_income[i] for i in range(total_years)]
        discounted_fcff = [fcff[i] / ((1 + discount_rate) ** (i + 1)) for i in range(total_years)]

        terminal_value = (fcff[-1] * (1 + terminal_growth_rate)) / (discount_rate - terminal_growth_rate)
        discounted_terminal_value = terminal_value / ((1 + discount_rate) ** total_years)
        dcf_valuation = round(sum(discounted_fcff) + discounted_terminal_value, 2)

        # Step 3: Insert Valuation Years after calculation
        for i in range(total_years):
            y = years[i]
            cursor.execute("""
                EXEC InsertValuationYear ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            """, (
                valuation_id,
                y.get('year', 0),
                y.get('isProjected', False),
                y.get('revenues', 0),
                y.get('cogs', 0),
                y.get('employeeExpense', 0),
                y.get('sgaExpense', 0),
                y.get('depreciation', 0),
                y.get('interestExpense', 0),
                y.get('otherIncome', 0),
                ebitda[i],
                ebit[i],
                nopat[i],
                fcff[i],
                discounted_fcff[i]
            ))

        # Step 4: Update summary
        cursor.execute("""
            UPDATE Valuations 
            SET TerminalValue = ?, 
                DiscountedTerminalValue = ?, 
                DCFValuation = ?
            WHERE Id = ?
        """, (terminal_value, discounted_terminal_value, dcf_valuation, valuation_id))

        conn.commit()

        # Step 5: Return result
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


@valuations_bp.route('/api/valuations', methods=['GET'])
@jwt_required()
def get_valuations():
    try:
        user_id = int(get_jwt_identity())  # or hardcode for now
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT Id, CompanyCode, Country, DiscountRate, TaxRate,
                   TerminalGrowthRate, TerminalValue, DiscountedTerminalValue,
                   DCFValuation, CreatedAt
            FROM Valuations
            WHERE UserId = ?
            ORDER BY CreatedAt DESC
        """, (user_id,))

        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        valuations = [dict(zip(columns, row)) for row in rows]

        return jsonify(valuations), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@valuations_bp.route('/api/valuations/<int:valuation_id>/years', methods=['GET'])
@jwt_required()
def get_valuation_years(valuation_id):
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT Year, IsProjected, Revenues, COGS, EmployeeExpense,
                   SGAExpense, Depreciation, InterestExpense, OtherIncome,
                   EBITDA, EBIT, NOPAT, FCFF, DiscountedFCFF
            FROM ValuationYears
            WHERE ValuationId = ?
            ORDER BY Year
        """, (valuation_id,))

        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        years = [dict(zip(columns, row)) for row in rows]

        return jsonify(years), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@valuations_bp.route('/api/valuations/<int:valuation_id>', methods=['GET'])
@jwt_required()
def get_valuation_detail(valuation_id):
    try:
        conn = get_db()
        cursor = conn.cursor()

        # Get valuation
        cursor.execute("SELECT * FROM Valuations WHERE Id = ?", (valuation_id,))
        valuation = cursor.fetchone()
        if not valuation:
            return jsonify({"error": "Valuation not found"}), 404

        valuation_columns = [column[0] for column in cursor.description]
        valuation_data = dict(zip(valuation_columns, valuation))

        # Get related years
        cursor.execute("SELECT * FROM ValuationYears WHERE ValuationId = ? ORDER BY Year", (valuation_id,))
        year_columns = [column[0] for column in cursor.description]
        years_data = [dict(zip(year_columns, row)) for row in cursor.fetchall()]

        valuation_data['years'] = years_data

        return jsonify(valuation_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


