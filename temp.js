// Middleware functions
// const myMiddleware = (req, res, next) => {
//   const { username, password } = req.body;
//   if (Object.keys(req.query).length !== 2) {
//     res.status(401).json({ responsemessage: "Please Check your payload" });
//   }
//   else if (username.length > 0 && password.length > 0) {
//     next(); // Call the next middleware in the stack
//   }
//   else {
//     res.status(400).json({ responsemessage: 'Please enter valid username and password' });
//   }
// };

// // Function to check if a token is valid
// function checkTokenValidity(token, secretKey) {
//   try {
//     // Verify the token
//     const decoded = jwt.verify(token, secretKey);

//     // If verification succeeds, the token is valid
//     return { valid: true, decoded };
//   } catch (error) {
//     // If verification fails, the token is invalid
//     return { valid: false, error: error.message };
//   }
// }

// function extractTokenFromHeader(req, res, next) {
//   // Get the Authorization header
//   const authHeader = req.headers['authorization'];

//   // Check if the header exists and starts with "Bearer "
//   if (authHeader && authHeader.startsWith('Bearer ')) {
//     // Extract the token (remove "Bearer " from the beginning)
//     const token = authHeader.substring(7);

//     // Attach the token to the request object for further processing
//     req.token = token;
//   }

//   // Call the next middleware
//   next();
// }

// app.get('/islogin', (req, res) => {
//   const { state } = req.query;
//   try {
//     if (state === "islogin") {
//       isLoggin = true;
//       res.status(200).json({ state: true });
//     }
//     else if (state === "logout") {
//       isLoggin = false
//       res.status(200).json({ state: false });
//     }
//     else {
//       res.status(200).json({ state: isLoggin });
//     }
//   } catch {
//     res.status(500).json({ error: "Try Again" });
//   }
// })

// app.use('/user', userRoutes);
//post api
//const userRoutes = require('./components/routes/userRoute')
