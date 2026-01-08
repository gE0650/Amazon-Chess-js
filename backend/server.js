const express = require("express");
const cors = require("cors");
const app = express();
const CreateRouter = require("./routers/create");
const SearchRouter = require("./routers/search");
const MoveRouter = require("./routers/move");

app.use(express.json());
app.use(cors());
app.use("/create/", CreateRouter);
app.use("/search/", SearchRouter);
app.use("/move/", MoveRouter);

app.listen(3000, () => {
  console.log("amazon server running at 3000");
});
