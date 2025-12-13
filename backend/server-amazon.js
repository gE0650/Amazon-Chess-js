const express = require("express");
const cors = require("cors");
const app = express();


// amazon variant routers
const AmazonCreateRouter = require("./routers/amazonCreate");
const AmazonSearchRouter = require("./routers/amazonSearch");

app.use(express.json());
app.use(cors());

// mount amazon endpoints under /amazon
app.use('/amazon/create/', AmazonCreateRouter);
app.use('/amazon/search/', AmazonSearchRouter);

app.listen(3100, () => {
  console.log('amazon variant server running at 3100');
});
