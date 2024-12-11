import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import { Database, Resource } from '@adminjs/sql';
import Connect from 'connect-pg-simple';
import session from 'express-session';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

AdminJS.registerAdapter({ Database, Resource });

const DEFAULT_ADMIN = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
};

const authenticate = async (email: string, password: string) => {
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
        return Promise.resolve(DEFAULT_ADMIN);
    }
    return null;
};

export const initAdmin = (db: any) => {
    const admin = new AdminJS({
        resources: [
            {
                resource: db.table('users'),
                options: {
                    properties: {
                        created_at: { isVisible: false },
                        updated_at: { isVisible: false },
                        password_hash: { 
                            isVisible: false 
                        },
                        password: {
                            type: 'password',
                            isVisible: {
                                list: false,
                                edit: true,
                                filter: false,
                                show: false,
                            },
                        }
                    },
                    actions: {
                        new: {
                            before: async (request: any) => {
                                if (request.payload.password) {
                                    request.payload = {
                                        ...request.payload,
                                        password_hash: await bcrypt.hash(request.payload.password, 10),
                                    };
                                    delete request.payload.password;
                                }
                                return request;
                            },
                        },
                        edit: {
                            before: async (request: any) => {
                                if (request.payload.password) {
                                    request.payload = {
                                        ...request.payload,
                                        password_hash: await bcrypt.hash(request.payload.password, 10),
                                    };
                                    delete request.payload.password;
                                } else {
                                    delete request.payload.password;
                                }
                                return request;
                            },
                        },
                        delete: {
                            before: async (request: any) => {
                                console.log('Attempting to delete user:', request.params.recordId);
                                return request;
                            },
                            after: async (response: any) => {
                                console.log('Successfully deleted user and related vocabulary');
                                return response;
                            }
                        }
                    }
                }
            },
            {
                resource: db.table('vocabulary'),
                options: {
                    properties: {
                        created_at: { isVisible: false },
                        updated_at: { isVisible: false }
                    }
                }
            }
        ]
    });

    const ConnectSession = Connect(session);
    const sessionStore = new ConnectSession({
        conObject: {
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production',
        },
        tableName: 'session',
        createTableIfMissing: true,
    });

    const router = AdminJSExpress.buildAuthenticatedRouter(
        admin,
        {
            authenticate,
            cookieName: process.env.COOKIE_NAME || 'adminjs',
            cookiePassword: process.env.COOKIE_PASSWORD || 'sessionsecret',
        },
        null,
        {
            store: sessionStore,
            resave: true,
            saveUninitialized: true,
            secret: process.env.COOKIE_PASSWORD || 'sessionsecret',
            cookie: {
                httpOnly: process.env.NODE_ENV === 'production',
                secure: process.env.NODE_ENV === 'production',
            },
            name: process.env.COOKIE_NAME || 'adminjs',
        }
    );

    return { admin, router };
};