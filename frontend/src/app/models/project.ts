export interface Project {
    _id?: string
    name: string
    panels?: [{
        panel: object
    }]
    workItems?: [{
        workItem: object
    }]
    tags?: [{
        tag: object
    }]
    createdAt?: string
    updatedAt?: string
}