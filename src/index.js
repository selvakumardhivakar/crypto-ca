const app = require("./app");
// Configuring port
const port = process.env.PORT || 8000;
// Listening to the server
app.listen(port, () => console.log(`Server is running on the port ${port}`));
