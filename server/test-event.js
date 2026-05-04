async function test() {
  try {
    const mongoose = require('mongoose');
    const jwt = require('jsonwebtoken');
    require('dotenv').config();

    await mongoose.connect(process.env.DATABASE_URL);
    
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
