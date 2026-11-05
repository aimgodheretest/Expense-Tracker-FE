import { useEffect, useState } from "react";

import {
  addExpenseToDatabase,
  getExpensesFromDatabase,
  updateExpenseInDatabase,
  deleteExpenseFromDatabase,
} from "../services/firebase";

function ExpenseTracker() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
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

  // Reset form fields
  const resetForm = () => {
    setAmount("");
    setDescription("");
    setCategory("Food");
    setEditingExpenseId(null);
  };

  // POST / PUT: Add or update an expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const expenseData = {
      amount: Number(amount),
      description: description.trim(),
      category,
    };

    try {
      setSubmitting(true);

      if (editingExpenseId) {
        // PUT: Update existing expense
        const updatedExpense = await updateExpenseInDatabase(
          editingExpenseId,
          expenseData,
        );

        setExpenses((prevExpenses) =>
          prevExpenses.map((expense) =>
            expense.id === editingExpenseId ? updatedExpense : expense,
          ),
        );
      } else {
        // POST: Add new expense
        const savedExpense = await addExpenseToDatabase(expenseData);

        setExpenses((prevExpenses) => [...prevExpenses, savedExpense]);
      }

      resetForm();
    } catch (error) {
      console.error("Saving expense error:", error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit: Populate form with existing expense details
  const handleEdit = (expense) => {
    setEditingExpenseId(expense.id);
    setAmount(String(expense.amount));
    setDescription(expense.description);
    setCategory(expense.category);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // DELETE: Remove expense from Firebase
  const handleDelete = async (expenseId) => {
    setError("");

    try {
      setDeletingId(expenseId);

      await deleteExpenseFromDatabase(expenseId);

      setExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense.id !== expenseId),
      );

      // Cancel editing if the currently edited expense is deleted
      if (editingExpenseId === expenseId) {
        resetForm();
      }

      console.log("Expense successfuly deleted");
    } catch (error) {
      console.error("Deleting expense error:", error);
      setError(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="expense-tracker">
      <div className="expense-header">
        <h2>Daily Expenses</h2>
        <p>Track and manage your daily spending.</p>
      </div>

      {/* Add / Edit Expense Form */}
      <div className="expense-form-card">
        <h5>{editingExpenseId ? "Edit Expense" : "Add New Expense"}</h5>

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
            {submitting
              ? "Saving..."
              : editingExpenseId
                ? "Update Expense"
                : "Add Expense"}
          </button>

          {editingExpenseId && (
            <button
              type="button"
              className="btn btn-outline-danger w-100 mt-2"
              onClick={resetForm}
              disabled={submitting}
            >
              Cancel Editing
            </button>
          )}
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
                <div className="expense-details">
                  <h6>{expense.description}</h6>
                  <span>{expense.category}</span>
                </div>

                <div className="expense-actions">
                  <strong>₹{Number(expense.amount).toFixed(2)}</strong>

                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleEdit(expense)}
                    disabled={
                      submitting ||
                      deletingId !== null ||
                      editingExpenseId !== null
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(expense.id)}
                    disabled={submitting || deletingId !== null}
                  >
                    {deletingId === expense.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpenseTracker;
