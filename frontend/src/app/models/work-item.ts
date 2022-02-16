export interface WorkItem {
    _id?: string
    name: string
    panel: string
    position: number
    panelDateRegistry: [{
        panel: string,
        date: Date
    }]
    createdAt?: string
    updatedAt?: string
}