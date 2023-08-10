export const AppConfig = {
  database: {
    connectionString: "postgres://postgres:postgres@0.0.0.0:5432/life-cycle",
  },
  session: {
    secrets: ["supersecretsecret"],
    sessionFileLocation: "/app/sessions",
  },
  pages: {
    home: {
      title: "Home",
      description: "Home page",
    },
    login: {
      title: "Login",
      description: "Login page",
    },
    settings: {
      title: "Settings",
      description: "Settings page",
    }
  }
}
