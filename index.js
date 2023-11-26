const express = require('express');
const port = process.env.PORT || 8000;
const cors = require('cors'); // Import the 'cors' middleware

const app = express();

// Enable CORS for all routes or specify specific origins, methods, etc.
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  try {
      email = 'nikita@bdec.in'
    const user = await prisma.user.findUnique({
      where: { email }
    });
    console.log(user);

    if (!user) {
      console.log('Invalid credentials')
      // return res.status(401).json({ error: 'Invalid credentials' });
    }

   
  }catch(e) {
      console.log('error at startup: ', e.toString());
  }

});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

app.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Hash the password before storing it in the database
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({ error: 'Error registering user' });
  }
});
const jwt = require('jsonwebtoken');
const { DateTime } = require('luxon');
function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    // Add any other user-related data as needed
  };

  return jwt.sign(payload, 'your-secret-key', { expiresIn: '1h' });
}

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('Invalid credentials')
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      console.log('Password did not match')
      return res.status(401).json({ error: 'Password did not match' });
    }

    // If email and password are valid, you can generate a token and send it in the response for authentication.

    // For example, using JSON Web Tokens (JWT):
    const token = generateToken(user);

    res.status(200).json({ token: token, userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/expense', async (req, res) => {
  try {
    const { userId, amount, description, date } = req.body;

    // Assuming date is in the format "YYYY-MM-DD"
    const formattedDate = new Date(`${date}T00:00:00.000Z`);

    const expense = await prisma.expense.create({
      data: {
        userId,
        amount,
        description,
        date: formattedDate,
      },
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error({ error: 'Error adding expense: ' + error.toString() });
    res.status(500).json({ error: 'Error adding expense: ' + error.toString() });
  }
});

app.get('/expenses/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const expenses = await prisma.expense.findMany({
      where: {
        userId: userId,
      },
    });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching expenses' });
  }
});


// API endpoint to update an expense for a specific user
app.put('/api/expense/:userId/:expenseId', async (req, res) => {
  console.log(' calling api of update expense ');
  const { userId, expenseId } = req.params;
  const { amount, description, date } = req.body;

  try {
    console.log(req.body);
    console.log(req.params);
    // Check if the expense record exists and belongs to the specified user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: parseInt(expenseId, 10),
        userId: parseInt(userId, 10),
      },
    });
    console.log(existingExpense);

    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense record not found' });
    }

    // Update the expense record
    const updatedExpense = await prisma.expense.update({
      where: { id: existingExpense.id },
      data: {
        amount,
        description,
        date: new Date(date), // Convert date to Date object
      },
    });
    console.log(updatedExpense);

    res.json(updatedExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating expense' });
  }
});




// API endpoint to delete an expense for a specific user
app.delete('/api/expense/:userId/:expenseId', async (req, res) => {
  const { userId, expenseId } = req.params;

  try {
    // Check if the expense record exists and belongs to the specified user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: parseInt(expenseId, 10),
        userId: parseInt(userId, 10),
      },
    });

    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense record not found' });
    }

    // Delete the expense record
    await prisma.expense.delete({
      where: { id: existingExpense.id },
    });

    res.json({ message: 'Expense record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting expense' });
  }
});

// API endpoint to add income
app.post('/income', async (req, res) => {
  try {
    const { userId, amount, description, date } = req.body;

    // Handle the conversion from "YYYY-mm-dd" to a JavaScript Date object
    const formattedDate = new Date(`${date}T00:00:00Z`);

    const income = await prisma.income.create({
      data: {
        userId,
        amount,
        description,
        date: formattedDate,
      },
    });

    res.status(201).json(income);
  } catch (error) {
    console.error('Error adding income:', error);
    res.status(500).json({ error: 'Error adding income: ' + error.toString() });
  }
});

// API endpoint to get incomes for a specific user
app.get('/incomes/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const incomes = await prisma.income.findMany({
      where: {
        userId: userId,
      },
    });
    res.status(200).json(incomes);
  } catch (error) {
    console.error('Error fetching incomes:', error);
    res.status(500).json({ error: 'Error fetching incomes' });
  }
});

// API endpoint to update income for a specific user
app.put('/api/income/:userId/:incomeId', async (req, res) => {
  const { userId, incomeId } = req.params;
  const { amount, description, date } = req.body;

  try {
    // Check if the income record exists and belongs to the specified user
    const existingIncome = await prisma.income.findFirst({
      where: {
        id: parseInt(incomeId, 10),
        userId: parseInt(userId, 10),
      },
    });

    if (!existingIncome) {
      return res.status(404).json({ error: 'Income record not found' });
    }

    // Handle the conversion from "YYYY-mm-dd" to a JavaScript Date object
    const formattedDate = new Date(`${date}T00:00:00Z`);

    // Update the income record
    const updatedIncome = await prisma.income.update({
      where: { id: existingIncome.id },
      data: {
        amount,
        description,
        date: formattedDate,
      },
    });

    res.json(updatedIncome);
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ error: 'Error updating income' });
  }
});

// API endpoint to delete income for a specific user
app.delete('/api/income/:userId/:incomeId', async (req, res) => {
  const { userId, incomeId } = req.params;

  try {
    // Check if the income record exists and belongs to the specified user
    const existingIncome = await prisma.income.findFirst({
      where: {
        id: parseInt(incomeId, 10),
        userId: parseInt(userId, 10),
      },
    });

    if (!existingIncome) {
      return res.status(404).json({ error: 'Income record not found' });
    }

    // Delete the income record
    await prisma.income.delete({
      where: { id: existingIncome.id },
    });

    res.json({ message: 'Income record deleted successfully' });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ error: 'Error deleting income' });
  }
});




async function calculateTotalIncome() {
  try {
    const incomes = await prisma.income.findMany();
    const totalIncome = incomes.reduce((total, income) => total + income.amount, 0);
    return totalIncome;
  } catch (error) {
    throw error;
  }
}

async function calculateTotalExpenses() {
  try {
    const expenses = await prisma.expense.findMany();
    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
    return totalExpenses;
  } catch (error) {
    throw error;
  }
}

// Calculate total income for a specific user
async function calculateTotalIncomeForUser(userId) {
  try {
    const incomes = await prisma.income.findMany({
      where: {
        userId: userId, // Filter incomes for the specific user
      },
    });
    const totalIncome = incomes.reduce((total, income) => total + income.amount, 0);
    return totalIncome;
  } catch (error) {
    throw error;
  }
}

// Calculate total expenses for a specific user
async function calculateTotalExpensesForUser(userId) {
  try {
    const expenses = await prisma.expense.findMany({
      where: {
        userId: userId, // Filter expenses for the specific user
      },
    });
    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
    return totalExpenses;
  } catch (error) {
    throw error;
  }
}

// API endpoint to get total income for a specific user
app.get('/api/total-income/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const totalIncome = await calculateTotalIncomeForUser(parseInt(userId, 10));
    res.json({ totalIncome });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching total income' });
  }
});

// API endpoint to get total expenses for a specific user
app.get('/api/total-expenses/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const totalExpenses = await calculateTotalExpensesForUser(parseInt(userId, 10));
    res.json({ totalExpenses });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching total expenses' });
  }
});
async function calculateTotalSavingsForUser(userId) {
  try {
    const savingsContributions = await prisma.savingsContribution.findMany({
      where: {
        savingsGoal: {
          user: {
            id: userId,
          },
        },
      },
    });

    // Calculate the total savings by summing the contribution amounts
    const totalSavings = savingsContributions.reduce(
      (total, contribution) => total + contribution.amount,
      0
    );

    return totalSavings;
  } catch (error) {
    console.error('Error calculating total savings:', error);
    throw error;
  }
}

// API endpoint to calculate and get the remaining budget for a specific user
app.get('/api/remaining-budget/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const totalIncome = await calculateTotalIncomeForUser(parseInt(userId, 10));
    const totalExpenses = await calculateTotalExpensesForUser(parseInt(userId, 10));
    const totalSavings = await calculateTotalSavingsForUser(parseInt(userId, 10));

    const remainingBudget = totalIncome - totalExpenses - totalSavings;
    res.json({ remainingBudget });
  } catch (error) {
    res.status(500).json({ error: 'Error calculating remaining budget: '+error.toString() });
  }
});

app.post('/api/savings-goals/:userId', async (req, res) => {

  const { userId } = req.params;
  const { name, targetAmount, startDate, endDate } = req.body;

  try {
    const savingsGoal = await prisma.savingsGoal.create({
      data: {
        userId: parseInt(userId, 10),
        name,
        targetAmount,
        currentAmount: 0, // Initial current amount is 0
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    res.status(201).json(savingsGoal);
  } catch (error) {
    console.error({ error: 'Error creating savings goal: ' + error.toString() });
    res.status(500).json({ error: 'Error creating savings goal: ' + error.toString() });
  }
});

app.put('/api/savings-goals/:userId/:goalId', async (req, res) => {
  const { userId, goalId } = req.params;
  const { name, targetAmount, startDate, endDate } = req.body;

  try {
    const updatedSavingsGoal = await prisma.savingsGoal.update({
      where: { id: parseInt(goalId, 10) },
      data: {
        name,
        targetAmount,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    res.json(updatedSavingsGoal);
  } catch (error) {
    console.error({ error: 'Error updating savings goal: ' + error.toString() });
    res.status(500).json({ error: 'Error updating savings goal: ' + error.toString() });
  }
});

app.delete('/api/savings-goals/:userId/:goalId', async (req, res) => {
  const { userId, goalId } = req.params;

  try {
    await prisma.savingsGoal.delete({
      where: { id: parseInt(goalId, 10) },
    });

    res.json({ message: 'Savings goal deleted successfully' });
  } catch (error) {
    console.error({ error: 'Error deleting savings goal: ' + error.toString() });
    res.status(500).json({ error: 'Error deleting savings goal: ' + error.toString() });
  }
});

app.get('/api/savings-goals/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId: parseInt(userId, 10) },
    });

    res.json(savingsGoals);
  } catch (error) {
    console.error({ error: 'Error retrieving savings goals: ' + error.toString() });
    res.status(500).json({ error: 'Error retrieving savings goals: ' + error.toString() });
  }
});

app.post('/api/savings-contributions/:userId/:goalId', async (req, res) => {
  const { userId, goalId } = req.params;
  const { amount, date } = req.body;

  try {
    const contribution = await prisma.savingsContribution.create({
      data: {
        savingsGoalId: parseInt(goalId, 10),
        amount,
        date: new Date(date),
      },
    });

    // After creating the contribution, update the current amount in the associated savings goal
    const goal = await prisma.savingsGoal.update({
      where: { id: parseInt(goalId, 10) },
      data: {
        currentAmount: {
          increment: amount, // Increment the current amount by the contribution amount
        },
      },
    });

    res.status(201).json(contribution);
  } catch (error) {
    console.error({ error: 'Error adding savings contribution: ' + error.toString() });
    res.status(500).json({ error: 'Error adding savings contribution: ' + error.toString() });
  }
});

app.get('/api/savings-contributions/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const contributions = await prisma.savingsContribution.findMany({
      include: {
        savingsGoal: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json(contributions);
  } catch (error) {
    console.error({ error: 'Error retrieving savings contributions: ' + error.toString() });
    res.status(500).json({ error: 'Error retrieving savings contributions: ' + error.toString() });
  }
});


// Modify the route in your Node.js application
app.get('/api/categories/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const categories = await prisma.savingsGoal.findMany({
      where: {
        userId: parseInt(userId, 10), // Filter by user ID
      },
      select: {
        id: true,
        name: true,
      },
      distinct: ['name'],
    });

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Error fetching categories: ' + error.toString() });
  }
});

