import {createCookie, createFileSessionStorage,} from "@remix-run/node";
import {AppConfig} from "../config"; // or cloudflare/deno
import bcrypt from "bcryptjs";

// In this example the Cookie is created separately.
const sessionCookie = createCookie("__session", {
  secrets: AppConfig.session.secrets,
  sameSite: true,
});

const {getSession, commitSession, destroySession} =
  createFileSessionStorage({
    // The root directory where you want to store the files.
    // Make sure it's writable!
    dir: AppConfig.session.sessionFileLocation,
    cookie: sessionCookie,
  });

const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
}

const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
}

export {getSession, commitSession, destroySession, hashPassword, comparePassword};
