import dotenv from "dotenv"
dotenv.config()
const configs = {
    'DBConnection': `${process.env.DB_NAME}`,
}
 export default configs