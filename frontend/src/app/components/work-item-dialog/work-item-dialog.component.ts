import { Component, Inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { lastValueFrom, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

// Models
import { Tag } from 'src/app/models/tag';

// Services
import { TagService } from 'src/app/services/tag.service';
import { ProjectService } from 'src/app/services/project.service';

// Material
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

// A Color Picker
import * as AColorPicker from 'a-color-picker';

@Component({
  selector: 'app-work-item-dialog',
  templateUrl: './work-item-dialog.component.html',
  styleUrls: ['./work-item-dialog.component.css']
})
export class WorkItemDialogComponent implements OnInit {
  form!: FormGroup;
  idNumber: number = 0;
  title: string = '';
  description: string = '';
  tags: string[] = [];
  projectId: any = '';
  projectTags: Tag[] = [];
  characterLimitName = 50;

  // Etiquetas
  separatorKeysCodes: number[] = [];
  filteredTags: Observable<string[]>;
  selectedTags: string[] = [];
  originalSelectedTags: string[] = [];
  allTags: string[] = [];
  colorTags: any = [];
  fontColorTags: any = [];

  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;

  // https://stackblitz.com/edit/angular-72fu5r-gbfxti?file=src%2Fapp%2Fchips-autocomplete-example.ts,src%2Fapp%2Fchips-autocomplete-example.html

  constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<WorkItemDialogComponent>, @Inject(MAT_DIALOG_DATA) data: any, private tagService: TagService, private projectService: ProjectService) {
    this.idNumber = data.idNumber;
    this.title = data.title;
    this.description = data.description;
    this.tags = data.tags;
    this.projectTags = data.projectTags;

    this.form = this.fb.group({
      title: new FormControl(this.title),
      description: new FormControl(this.description),
      tag: new FormControl()
    });

    this.filteredTags = this.form.get('tag')!.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) =>
        tag ? this._filter(tag) : this.allTags
      )
    );
  }

  async ngOnInit() {
    this.selectedTags = await this.getTagsNames(this.tags);
    this.originalSelectedTags = await this.getTagsNames(this.tags);
    let tagsOfProject = this.getTagsNamesOfProject();
    this.allTags = this.deleteSelectedTagsFromList(tagsOfProject, this.selectedTags);
  }

  async getTagsNames(tags: any[]): Promise<string[]> {
    let listOfTags: string[] = [];

    for (let tag of tags) {
      let t = await this.getTag(tag.tag);
      listOfTags.push(t.name);
    }

    return listOfTags;
  }

  async getTag(tagId: string): Promise<Tag> {
    return await lastValueFrom(this.tagService.getTag(tagId));
  }

  getTagsNamesOfProject(): string[] {
    let tagsOfProject = this.projectTags;
    let tagsNames: string[] = [];

    for (let tag of tagsOfProject) {
      tagsNames.push(tag.name);

      // Aprovechamos para rellenar el array colorTags y fontColorTags
      this.colorTags[tag.name] = tag.color;
      this.fontColorTags[tag.name] = this.setFontColor(tag.color);
    }

    return tagsNames;
  }

  deleteSelectedTagsFromList(listOfTagsNames: string[], selectedTagsNames: string[]) {
    let listWithNoCoincidences: string[] = []

    for (let tagName of listOfTagsNames) {
      if (!selectedTagsNames.includes(tagName)) {
        listWithNoCoincidences.push(tagName);
      }
    }

    return listWithNoCoincidences;
  }

  setFontColor(color: string) {
    let darkness = 0;

    let colorRGB: any = AColorPicker.parseColor(color, 'rgb');

    // Contar la percepción de luminosidad - human eye favors
    let luminance = (0.299 * colorRGB[0] + 0.587 * colorRGB[1] + 0.114 * colorRGB[2]) / 255;

    if (luminance > 0.5) darkness = 0; // bright colors - black font
    else darkness = 255; // dark colors - white font
                
    return `rgb(${darkness}, ${darkness}, ${darkness})`;
  }

  save() {
    // Title y Description del formulario
    let formTitle = this.form.value.title;
    let formDescription = this.form.value.description;

    // Si el título está vacío, no hacer nada y warning
    if (this.form.get('title')!.value == "") {
      document.getElementById('warning')!.innerText = "El título no puede estar vacío";
      return;
    }

    // El título no está vacío
    document.getElementById('warning')!.innerText = "";

    // Si no cambia nada, no enviamos nada para actualizar
    if (this.title == formTitle  &&  this.description == formDescription  &&  !this.checkIfArrayHasChanged(this.originalSelectedTags, this.selectedTags)) return this.dialogRef.close();

    // Ha cambiado el title o el description, enviamos los datos para actualizar
    // this.form.get('tag')!.setValue(this.tags);
    let result = {
      title: formTitle,
      description: formDescription,
      tags: this.selectedTags
    }
    this.dialogRef.close(result);
  }

  delete() {
    this.dialogRef.close('delete');
  }

  close() {
    this.dialogRef.close();
  }

  checkIfArrayHasChanged(previousArray: string[], currentArray: string[]) {
    if (currentArray.length >= previousArray.length) {
      for (let item of currentArray) {
        if (!previousArray.includes(item)) {
          return true;
        }
      }
    }
    
    if (currentArray.length < previousArray.length) {
      for (let item of previousArray) {
        if (!currentArray.includes(item)) {
          return true;
        }
      }
    }

    return false;
  }

  remove(tag: string): void {
    let index = this.selectedTags.indexOf(tag);

    if (index >= 0) {
      this.selectedTags.splice(index, 1);
      this.allTags.push(tag);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    let value = event.option.viewValue
    this.selectedTags.push(value);
    this.tagInput.nativeElement.value = '';
    
    this.form.get('tag')!.setValue(null);

    let indexOfValue = this.allTags.indexOf(value);
    this.allTags.splice(indexOfValue, 1);
  }

  private _filter(value: string): string[] {
    let filterValue = value.toLowerCase();

    return this.allTags.filter((tag) => 
      tag.toLowerCase().includes(filterValue)
    );
  }

}
