import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable()
export class BaseHttpService {
    protected apiUrl = environment.apiUrl;

    constructor(protected http: HttpClient) {}
}
