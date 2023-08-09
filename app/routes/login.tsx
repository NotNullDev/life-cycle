import {Form, useActionData, useNavigation} from "@remix-run/react";
import {Input} from "~/lib/components/ui/input";
import {Button} from "~/lib/components/ui/button";
import {type ActionArgs, json, redirect} from "@remix-run/node";
import { db } from "db/db";
import {users} from "../../db/schema/schema";
import {eq} from "drizzle-orm";
import {commitSession, getSession, hashPassword} from "~/sessions";

export async function loader({request}: ActionArgs) {
    const session = await getSession(request.headers.get("Cookie"));

    if (session.get("userId")) {
        return redirect("/");
    }

    return null;
}

export async function action({request}: ActionArgs) {
    const form = await request.formData();
    console.log(form.entries());

    await new Promise(resolve => setTimeout(resolve, 4000));

    const errors = {
        userExists: true,
        passwordDoesNotMatch: true,
    };

    const email = form.get("email") as string;
    const name = form.get("name") as string;
    const password = form.get("password") as string;
    const repeatPassword = form.get("repeat-password") as string;

    const existingUser = await db.select({
        id: users.id,
    }).from(users).where(eq(users.email, email.trim())).limit(1);

    if (existingUser.length === 0) {
        errors.userExists = false
    }

    if (password === repeatPassword) {
        errors.passwordDoesNotMatch = false;
    }

    if (Object.values(errors).some(Boolean)) {
        return json({
            errors
        });
    }

    const userId = await db.insert(users).values({
        email: email.trim(),
        name: name.trim(),
        password: await hashPassword(password)
    }).returning({
        id: users.id,
    })

    const session = await getSession(request.headers.get("Cookie"));
    session.set("userId", userId);

    return redirect("/", {
        headers: {
            "Set-Cookie": await commitSession(session)
        }
    });
}

export default function LoginPage() {
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isBusy = navigation.formData?.get("_action") === "register" && navigation.state !== "idle";

    return <div className="">
        <Form method="post" className="flex container mx-auto flex-col gap-1 max-w-[500px] bg-background rounded border pb-6">
            <h1 className="text-2xl my-6">Welcome</h1>
            <Input type="email" name="email" placeholder="Email" />
            {actionData?.errors.userExists && <div className="text-red-500">User already exists</div>}
            <Input type="text" name="name" placeholder="Name" />
            <Input type="password" name="password" placeholder="Password" />
            {actionData?.errors.passwordDoesNotMatch && <div className="text-red-500">Passwords do not match</div>}
            <Input type="password" name="repeat-password" placeholder="Repeat password" />
            {actionData?.errors.passwordDoesNotMatch && <div className="text-red-500">Passwords do not match</div>}
            <Button name="_action" value="register" className="mt-4" disabled={isBusy}>Register</Button>
        </Form>
    </div>
}
