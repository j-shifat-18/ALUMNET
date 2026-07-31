import app from "./app.js";
import "dotenv/config";

const port = process.env.PORT || 8000;

async function main() {
  try {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();