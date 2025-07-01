from flask import Blueprint, request, jsonify
import pyodbc
from flask_jwt_extended import get_jwt_identity, jwt_required
from db import get_db
projection_bp = Blueprint('projection', __name__)


conn = get_db()
cursor = conn.cursor()
# ... your queries


@projection_bp.route('/api/projections', methods=['POST'])
#@jwt_required()
def create_projection():
    try:
        user_id = 1 # int(get_jwt_identity())
        data = request.get_json()

    
        # Step 1: Perform Projection Calculation
        projection_years = int(data['projection_years'])
        actual_years = int(data['actual_years'])
        total_years = actual_years + projection_years

        fields = ['revenues', 'cogs', 'employee_expense', 'sga_expense',
                  'depreciation', 'interest_expense', 'other_income']

        growth_rates = {k: float(data['growth_rates'].get(k, 0)) / 100 for k in fields}
        series = data['data']

        for field in fields:
            for _ in range(projection_years):
                last_val = series[field][-1]
                series[field].append(round(last_val * (1 + growth_rates[field]), 2))

        discount_rate = float(data['discount_rate']) / 100
        tax_rate = float(data['tax_rate']) / 100
        terminal_growth_rate = float(data.get('terminal_growth_rate', 0.02)) / 100
        country = data['country']

        ebitda = [series['revenues'][i] - series['cogs'][i] - series['employee_expense'][i] - series['sga_expense'][i] for i in range(total_years)]
        ebit = [ebitda[i] - series['depreciation'][i] for i in range(total_years)]
        nopat = [ebit[i] * (1 - tax_rate) for i in range(total_years)]
        fcff = [nopat[i] + series['depreciation'][i] - series['interest_expense'][i] + series['other_income'][i] for i in range(total_years)]
        discounted_fcff = [fcff[i] / ((1 + discount_rate) ** (i + 1)) for i in range(total_years)]

        terminal_value = (fcff[-1] * (1 + terminal_growth_rate)) / (discount_rate - terminal_growth_rate)
        discounted_terminal_value = terminal_value / ((1 + discount_rate) ** total_years)
        dcf_valuation = round(sum(discounted_fcff) + discounted_terminal_value, 2)

        # Step 2: Insert Projection Header
        cursor.execute("""
            SET NOCOUNT ON;
            DECLARE @NewId INT;
            EXEC InsertProjectionData ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @NewId OUTPUT;
            SELECT @NewId AS ProjectionId;
        """, (
            user_id,
            data['company_code'],
            country,
            discount_rate,
            tax_rate,
            terminal_growth_rate,
            terminal_value,
            discounted_terminal_value,
            dcf_valuation,
            actual_years,
            projection_years
        ))

        output_id = cursor.fetchone()
        if not output_id:
            raise Exception("Projection ID not returned from stored procedure.")
        projection_id = output_id[0]

        # Step 3: Insert Year-wise Data
        for i in range(total_years):
            cursor.execute("""
                EXEC InsertProjectionYear ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                """, (
                projection_id,
                i,
                series['revenues'][i],
                series['cogs'][i],
                series['employee_expense'][i],
                series['sga_expense'][i],
                series['depreciation'][i],
                series['interest_expense'][i],
                series['other_income'][i],
                ebitda[i],
                ebit[i],
                nopat[i],
                fcff[i],
                discounted_fcff[i]
            ))

        conn.commit()

        return jsonify({
            "message": "Projection created",
            "projectionId": projection_id,
            "dcfValuation": dcf_valuation,
            "terminalValue": round(terminal_value, 2),
            "discountedTerminalValue": round(discounted_terminal_value, 2),
            "discountedFcff": [round(x, 2) for x in discounted_fcff]
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@projection_bp.route('/api/projections', methods=['GET'])
@jwt_required()
def get_projections():
    try:
        user_id = int(get_jwt_identity())
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT Id, CompanyCode, Country, DiscountRate, TaxRate,
                   TerminalGrowthRate, TerminalValue, DiscountedTerminalValue,
                   DCFValuation, ActualYears, ProjectionYears, CreatedAt
            FROM Projections
            WHERE UserId = ?
            ORDER BY CreatedAt DESC
        """, (user_id,))

        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        projections = [dict(zip(columns, row)) for row in rows]

        return jsonify(projections), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@projection_bp.route('/api/projections/<int:projection_id>', methods=['GET'])
@jwt_required()
def get_projection_detail(projection_id):
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM Projections WHERE Id = ?", (projection_id,))
        projection = cursor.fetchone()
        if not projection:
            return jsonify({"error": "Projection not found"}), 404

        projection_columns = [column[0] for column in cursor.description]
        projection_data = dict(zip(projection_columns, projection))

        cursor.execute("SELECT * FROM ProjectionYears WHERE ProjectionId = ? ORDER BY YearIndex", (projection_id,))
        year_columns = [column[0] for column in cursor.description]
        years_data = [dict(zip(year_columns, row)) for row in cursor.fetchall()]

        projection_data['years'] = years_data

        return jsonify(projection_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@projection_bp.route('/api/projections/<int:projection_id>/years', methods=['GET'])
@jwt_required()
def get_projection_years(projection_id):
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT YearIndex, Revenues, COGS, EmployeeExpense,
                   SGAExpense, Depreciation, InterestExpense, OtherIncome,
                   EBITDA, EBIT, NOPAT, FCFF, DiscountedFCFF
            FROM ProjectionYears
            WHERE ProjectionId = ?
            ORDER BY YearIndex
        """, (projection_id,))

        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        years = [dict(zip(columns, row)) for row in rows]

        return jsonify(years), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500