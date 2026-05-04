

async function test() {
  try {
    // We don't have a token, so we can't test unless we login first.
    // Let's just find a user from the DB and sign a token.
    const mongoose = require('mongoose');
    const jwt = require('jsonwebtoken');
    require('dotenv').config({ path: '../server/.env' });

    await mongoose.connect(process.env.MONGO_URI);
    
    // Find a REP or ADMIN user
    const db = mongoose.connection.db;
    const user = await db.collection('users').findOne({ role: { $in: ['REP', 'ADMIN'] } });
    if (!user) {
      console.log('No REP/ADMIN user found');
      process.exit(1);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    console.log('User:', user.email, 'Role:', user.role);

    const payload = {
      title: "Cgicig",
      description: "Cgjcgic",
      category: "SPORTS",
      date: "2026-06-15",
      startTime: "09:00",
      endTime: "10:00",
      venue: "Vcticgi",
      requiresRegistration: false,
      capacity: null,
      registrationDeadline: undefined,
    };

    const res = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Error Status:', res.status);
      console.error('Error Data:', data);
    } else {
      console.log('Success:', data);
    }
  } catch (error) {
    console.error('Catch Error:', error);
  } finally {
    process.exit(0);
  }
}

test();
