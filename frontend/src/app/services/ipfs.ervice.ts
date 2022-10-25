import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {API_URLS} from "@app/constants/api";

export const API_IPFS_GATEWAY_URL = 'https://ipfs.io/ipfs/';

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
