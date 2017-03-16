export default {
  iconClassName: 'fa fa-user',
  type: 'basic',
  name: 'login',
  schema: {
    component: 'RootWidget',
    schemaChildren: [
      {
        component: "A10Form",
        name: "AuthForm",
        schema: "auth",
        horizontal: true,
        schemaChildren: [
          {
            component: "A10Field",
            name: "credentials.username",
            label: "Username"
          },
          {
            component: "A10Field",
            name: "credentials.password",
            label: "Password"
          },
          {
            component: "A10SubmitButtons"
          }
        ]
      }
    ]
  }
};
