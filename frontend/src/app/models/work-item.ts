export interface WorkItem {
    _id?: string
    idNumber: number
    title: string
    description?: string
    panel: string
    position: number
    panelDateRegistry: [{
        panel: string,
        date: Date
    }]
    tags?: [{
        tag: object
    }]
    createdAt?: string
    updatedAt?: string
}