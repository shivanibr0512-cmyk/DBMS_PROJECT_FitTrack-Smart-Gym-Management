# Create login accounts

The app's authentication table is separate from your existing gym tables. Run this SQL in MySQL after opening `fittrack_db`.

```sql
CREATE TABLE IF NOT EXISTS app_users (
  User_ID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  Email VARCHAR(150) NOT NULL UNIQUE,
  Password_Hash VARCHAR(255) NOT NULL,
  Role ENUM('Admin','Trainer') NOT NULL,
  Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Generate password hashes using the command in the main README (`node -e ...`) and insert one Admin and one Trainer account. Do not store plaintext passwords.
