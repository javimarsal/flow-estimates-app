import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Tag } from '../models/tag';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class TagService {
  URL_API = `${environment.URL_API}/api/tags`;

  constructor(private http: HttpClient) { }

  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(this.URL_API);
  }

  getTag(tid: string): Observable<Tag> {
    return this.http.get<Tag>(`${this.URL_API}/${tid}`)
  }

  updateTag(tag: Tag): Observable<any> {
    return this.http.put(this.URL_API + `/${tag._id}`, tag);
  }

  createTag(tag: Tag): Observable<any> {
    return this.http.post(this.URL_API, tag);
  }

  deleteTag(id?: string): Observable<any> {
    return this.http.delete(this.URL_API + `/${id}`);
  }
}
