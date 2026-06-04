require("dotenv").config();
const supabaseAdmin = require("./config/supabaseAdmin");

async function testConnection() {
  console.log("Supabase URL:", process.env.SUPABASE_URL);
  try {
    const { data, error } = await supabaseAdmin
      .from("conversations")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Database query returned an error:", error);
    } else {
      console.log("Database query successful. Data:", data);
    }
  } catch (err) {
    console.error("Catch block error:", err);
  }
}

testConnection();
