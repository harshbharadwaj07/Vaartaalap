const mongoose=require("mongoose");
// mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Successful connection
mongoose.connection.on('connected', () => {
  console.log('Successfully connected to the database');
});

// Connection error
mongoose.connection.on('error', (err) => {
  console.error('Failed to connect to the database:', err);
});