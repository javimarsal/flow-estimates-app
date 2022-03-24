import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-read-delete-work-item',
  templateUrl: './read-delete-work-item.component.html',
  styleUrls: ['./read-delete-work-item.component.css']
})
export class ReadDeleteWorkItemComponent implements OnInit {
  // Para recuperar el nombre del elemento
  @Input() workItemId!: string;
  
  // Para eliminar el elemento
  @Input() htmlWorkItemDiv!: HTMLElement;

  // Id del Proyecto en el que nos encontramos
  projectId: any = '';

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getProjectId();
  }

  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  // Cambiar etiqueta por un input manteniendo su value
  tagToInput(editButton: HTMLElement, deleteButton: HTMLElement, acceptButton: HTMLElement, cancelButton: HTMLElement) {
    // let value = element.innerText;
    // console.log(element.innerHTML)
    // element.innerHTML = `<input value="${value}"/>`;
    
    // Ocultamos los botones de editar y eliminar
    editButton.style.display = "none";
    deleteButton.style.display = "none";

    // Mostramos los botones de aceptar y cancelar la edición
    acceptButton.style.display = "inline-block";
    cancelButton.style.display = "inline-block";
  }

  // Eliminar workItem
  deleteWorkItem() {
    // Nombre del workItem
    //let workItemName = element.innerText;

    // Obtener workItem por el nombre
    

    // Eliminar el workItem
    
  }

}
