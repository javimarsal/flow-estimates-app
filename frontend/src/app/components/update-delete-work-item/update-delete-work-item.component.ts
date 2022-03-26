import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkItemListComponent } from '../work-item-list/work-item-list.component';

@Component({
  selector: 'app-update-delete-work-item',
  templateUrl: './update-delete-work-item.component.html',
  styleUrls: ['./update-delete-work-item.component.css']
})
export class UpdateDeleteWorkItemComponent implements OnInit {
  // Para recuperar el nombre del elemento
  @Input() workItemId!: string;

  // Componente WorkItem
  @Input() workItemComponet!: WorkItemListComponent;
  
  // Elemento HTML del workItem
  @Input() htmlWorkItem_Box!: HTMLElement;

  // Id del Proyecto en el que nos encontramos
  projectId: any = '';

  // nombre del workItem para comprobar si ha cambiado y entonces actualizarlo
  workItemName: string = '';

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getProjectId();
  }

  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  editing() {
    this.workItemComponet.editing = true;
  }

  // Cambiar etiqueta por un input manteniendo su value
  tagToInput(editButton: HTMLElement, deleteButton: HTMLElement) {
    this.workItemName = this.htmlWorkItem_Box.innerText;
    this.htmlWorkItem_Box.innerHTML = `<input id="${this.workItemId}" (blur)='tagToParagraph(${editButton}, ${deleteButton})' value="${this.workItemName}">`;
    
    document.getElementById(this.workItemId)?.focus();

    //document.getElementsByTagName('input')[0].focus();
    
    // Ocultamos los botones de editar y eliminar
    editButton.style.display = "none";
    deleteButton.style.display = "none";

    // Guardar el valor actual en caso de que cancelemos la edición
    // console.log(this.htmlWorkItem_Box)
  }

  tagToParagraph(editButton: HTMLElement, deleteButton: HTMLElement) {
    // Volver a mostrar los botones de editar y eliminar
    //editButton.style.display = "inline-block";
    //deleteButton.style.display = "inline-block";
    console.log(this.htmlWorkItem_Box);
    // Valor del input
    let value = this.htmlWorkItem_Box.innerText;

    // Convertir el input en un p
    this.htmlWorkItem_Box.innerHTML = `<p class="description" title="{{${value}}}">${value}</p>`

    editButton.style.display = "inline-block";
    deleteButton.style.display = "inline-block";
    // Solo actualizar si el valor ha cambiado
  }

  // Eliminar workItem
  deleteWorkItem() {
    // Nombre del workItem
    //let workItemName = element.innerText;
    

    // Eliminar el workItem (el objeto y la ref en el proyecto)
    // this.workItemService
    // this.projectService
  }

}
