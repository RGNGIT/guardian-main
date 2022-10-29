import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_URLS } from "@app/constants/api";

@Injectable({
  providedIn: 'root'
})
export class IPFSService {
  constructor(
    private http: HttpClient
  ) { }

  public addFile(file: any): Observable<any> {
    return this.http.post<string>(`${API_URLS.ipfs.base}/file`, file, {
      headers: {
        'Content-Type': 'binary/octet-stream'
      }
    });
  }
}
