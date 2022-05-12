import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';

// Model
import { Tag } from 'src/app/models/tag';

// Services
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.css']
})

export class TagListComponent implements OnInit {
  projectId: any = '';
  tagsOfProject: Tag[] = [];

  constructor(private route: ActivatedRoute, private projectService: ProjectService) { }

  async ngOnInit() {
    this.getProjectId();

    // Obtenemos las etiquetas (tags) del proyecto
    await this.getProjectTags();
  }

  getProjectId() {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  async getProjectTags() {
    if (!this.projectId) {
      return;
    }

    try {
      this.tagsOfProject = await lastValueFrom(this.projectService.getTags(this.projectId));
    }
    catch(error) {
      console.log(error);
    }
  }

  // TODO
  async createTag() {}

}
