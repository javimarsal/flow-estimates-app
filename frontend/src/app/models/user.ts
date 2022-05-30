export interface User {
    _id?: string
    name: string
    surname: string
    email: string
    password: string
    verified: boolean
    openedProject?: object
    projects: [
        // {
        // role?: string,
        // project?: object
        // }
    ]
    createdAt?: string
    updatedAt?: string
}