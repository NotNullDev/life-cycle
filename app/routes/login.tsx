import {Form, useActionData, useNavigation} from "@remix-run/react";
import {Input} from "~/lib/components/ui/input";
import {Button} from "~/lib/components/ui/button";
import {type ActionArgs, json, redirect, type Session, type SessionData} from "@remix-run/node";
import {db} from "db/db";
import {users} from "../../db/schema/schema";
import {eq} from "drizzle-orm";
import {commitSession, comparePassword, getSession, hashPassword} from "~/sessions";
import { useState } from "react";

export async function loader({request}: ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.get("userId")) {
    return redirect("/");
  }

  return null;
}

export async function action({request}: ActionArgs) {
  const form = await request.formData();

  await new Promise(resolve => setTimeout(resolve, 500));

  let session:  Session<SessionData, SessionData> | undefined = undefined;
  const errors = {
    register: {
      userExists: false,
      passwordDoesNotMatch: false,
    },
    login: {
      invalidUsernameOrPassword: false
    },
    unknownAction: false,
  };

  let action = form.get("_action");
  let cookie = request.headers.get("Cookie");

  switch (action) {
    case "register": {
      const email = form.get("email") as string;
      const name = form.get("name") as string;
      const password = form.get("password") as string;
      const repeatPassword = form.get("repeat-password") as string;

      const existingUser = await db.select({
        id: users.id,
      }).from(users).where(eq(users.email, email.trim())).limit(1);

      if (existingUser.length !== 0) {
        errors.register.userExists = true
      }

      if (password !== repeatPassword) {
        errors.register.passwordDoesNotMatch = true;
      }

      if (Object.values(errors.register).some(Boolean)) {
        break;
      }

      const userId = await db.insert(users).values({
        email: email.trim(),
        name: name.trim(),
        password: await hashPassword(password)
      }).returning({
        id: users.id,
      })

      session = await getSession(cookie);
      session.set("userId", userId);

      break;
    }
    case "login": {
      const email = form.get("email") as string;
      const password = form.get("password") as string;

      const matchingUsers = await db.select({
        id: users.id,
        password: users.password,
      }).from(users).where(eq(users.email, email.trim())).limit(1);

      if (matchingUsers.length === 0) {
        errors.login.invalidUsernameOrPassword = true
        break;
      }

      const validPassword = await comparePassword(password, matchingUsers[0]?.password)

      if (!validPassword) {
        errors.login.invalidUsernameOrPassword = true;
        break;
      }

      session = await getSession(request.headers.get("Cookie"));
      session.set("userId", matchingUsers[0].id);
      break;
    }
    default:
      errors.unknownAction = true;
  }

  if (session) {
    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session)
      }
    });
  }

  return json({
    errors
  });
}

export default function LoginPage() {
  const [register, setRegister] = useState(false);
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isBusyRegister = navigation.formData?.get("_action") === "register" && navigation.state !== "idle";
  const isBusyLogin = navigation.formData?.get("_action") === "login" && navigation.state !== "idle";

  return <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px]">
    {
      register && (
        <Form method="post"
              className="flex container mx-auto flex-col gap-1 max-w-[500px] bg-background rounded border pb-6">
          <h1 className="text-2xl my-6">Welcome to Life Cycle</h1>
          <Input type="email" name="email" placeholder="Email"/>
          {actionData?.errors?.register.userExists && <div className="text-red-500">User already exists</div>}
          <Input type="text" name="name" placeholder="Name"/>
          <Input type="password" name="password" placeholder="Password"/>
          {actionData?.errors.register.passwordDoesNotMatch && <div className="text-red-500">Passwords do not match</div>}
          <Input type="password" name="repeat-password" placeholder="Repeat password"/>
          {actionData?.errors.register.passwordDoesNotMatch && <div className="text-red-500">Passwords do not match</div>}
          <Button name="_action" value="register" className="mt-4" disabled={isBusyRegister}>Register</Button>
          <p className="text-sm mt-3">Already have an account? <Button onClick={() => {setRegister(false)}} variant="ghost" size="sm">Login</Button></p>
        </Form>
      )
    }
    {
      !register && (
        <Form method="post"
              className="flex container mx-auto flex-col gap-1 max-w-[500px] bg-background rounded border pb-6">
          <h1 className="text-2xl my-6">Welcome back to Life Cycle</h1>
          <Input type="email" name="email" placeholder="Email"/>
          <Input type="password" name="password" placeholder="Password"/>
          {actionData?.errors.login.invalidUsernameOrPassword && <div className="text-red-500">Invalid username or password</div>}
          <Button name="_action" value="login" className="mt-4" disabled={isBusyLogin}>Login</Button>
          <p className="text-sm mt-3">Do not have account yet? <Button onClick={() => {setRegister(true)}} variant="ghost" size="sm">Register</Button></p>
        </Form>
      )
    }
  </div>
}
