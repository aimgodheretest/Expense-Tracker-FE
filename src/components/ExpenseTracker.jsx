import { useEffect, useState } from "react";

import {
  addExpenseToDatabase,
  getExpensesFromDatabase,
} from "../services/firebase";

function ExpenseTracker() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // GET: Fetch expenses when the component loads
  useEffect(() => {
    let isMounted = true;

    const fetchExpenses = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getExpensesFromDatabase();

        if (isMounted) {
          setExpenses(data);
        }
      } catch (error) {
        console.error("Fetching expenses error:", error);

        if (isMounted) {
          setError(error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchExpenses();

    return () => {
      isMounted = false;
    };
  }, []);

  // POST: Save expense to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const newExpense = {
      amount: Number(amount),
      description: description.trim(),
      category,
    };

    try {
      setSubmitting(true);

      const savedExpense = await addExpenseToDatabase(newExpense);

      // Update UI only after Firebase successfully saves the expense
      setExpenses((prevExpenses) => [...prevExpenses, savedExpense]);

      // Reset form after successful submission
      setAmount("");
      setDescription("");
      setCategory("Food");
    } catch (error) {
      console.error("Adding expense error:", error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="expense-tracker">
      <div className="expense-header">
        <h2>Daily Expenses</h2>
        <p>Track and manage your daily spending.</p>
      </div>

      {/* Add Expense Form */}
      <div className="expense-form-card">
        <h5>Add New Expense</h5>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="amount" className="form-label">
              Amount Spent (₹)
            </label>

            <input
              type="number"
              id="amount"
              className="form-control custom-input"
              placeholder="Enter amount"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description
            </label>

            <input
              type="text"
              id="description"
              className="form-control custom-input"
              placeholder="What did you spend on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="category" className="form-label">
              Category
            </label>

            <select
              id="category"
              className="form-select custom-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="Food">Food</option>
              <option value="Petrol">Petrol</option>
              <option value="Salary">Salary</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <button
            type="submit"
            className="btn signup-btn w-100"
            disabled={
              submitting ||
              !amount ||
              Number(amount) <= 0 ||
              !description.trim()
            }
          >
            {submitting ? "Saving Expense..." : "Add Expense"}
          </button>
        </form>
      </div>

      {/* Expense List */}
      <div className="expense-list-section">
        <h5>Your Expenses</h5>

        {loading ? (
          <p className="no-expenses">Loading your expenses...</p>
        ) : expenses.length === 0 ? (
          <p className="no-expenses">
            No expenses added yet. Start tracking your spending!
          </p>
        ) : (
          <div className="expense-list">
            {expenses.map((expense) => (
              <div className="expense-item" key={expense.id}>
                <div>
                  <h6>{expense.description}</h6>
                  <span>{expense.category}</span>
                </div>

                <strong>₹{Number(expense.amount).toFixed(2)}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpenseTracker;
