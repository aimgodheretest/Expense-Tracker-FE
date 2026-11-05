import { useState } from "react";

function ExpenseTracker() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");
  const [expenses, setExpenses] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newExpense = {
      id: crypto.randomUUID(),
      amount: Number(amount),
      description: description.trim(),
      category,
    };

    setExpenses((prevExpenses) => [...prevExpenses, newExpense]);

    // Reset form fields
    setAmount("");
    setDescription("");
    setCategory("Food");
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

          <button
            type="submit"
            className="btn signup-btn w-100"
            disabled={!amount || Number(amount) <= 0 || !description.trim()}
          >
            Add Expense
          </button>
        </form>
      </div>

      {/* Expense List */}
      <div className="expense-list-section">
        <h5>Your Expenses</h5>

        {expenses.length === 0 ? (
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

                <strong>₹{expense.amount.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpenseTracker;
