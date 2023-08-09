export const AppConfig = {
  database: {
    connectionString: "postgres://postgres:postgres@0.0.0.0:5432/life-cycle",
  },
  session: {
    secrets: ["supersecretsecret"],
    sessionFileLocation: "/app/sessions",
  }
}
