export default {
  iconClassName: 'fa fa-user',
  type: 'basic',
  name: 'login',
  schema: {
    component: 'RootWidget',
    schemaChildren: [
      {
        component: "A10Form",
        name: "Auth",
        schema: "auth",
        horizontal: true,
        schemaChildren: [
          {
            component: "A10Field",
            name: "crenditial.username",
            label: "Username"
          },
          {
            component: "A10Field",
            name: "crenditial.password",
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
