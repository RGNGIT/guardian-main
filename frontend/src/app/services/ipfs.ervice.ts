import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

export const API_VERSION = 'v1';
export const API_BASE_URL = `/api/${API_VERSION}`;
export const API_IPFS_GATEWAY_URL = 'https://ipfs.io/ipfs/';

@Injectable({
  providedIn: 'root'
})
export class IPFSService {
  private readonly url: string = `${API_BASE_URL}/ipfs`;
  constructor(
    private http: HttpClient
  ) { }

  public addFile(file: any): Observable<any> {
    return this.http.post<string>(`${this.url}/file`, file, {
      headers: {
        'Content-Type': 'binary/octet-stream'
      }
    });
  }
}
