/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Activity {
  /** @format int32 */
  id?: number;
  title?: string | null;
  /** @format date-time */
  dueDate?: string;
  completed?: boolean;
}

export interface Author {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  idBook?: number;
  firstName?: string | null;
  lastName?: string | null;
}

export interface Book {
  /** @format int32 */
  id?: number;
  title?: string | null;
  description?: string | null;
  /** @format int32 */
  pageCount?: number;
  excerpt?: string | null;
  /** @format date-time */
  publishDate?: string;
}

export interface CoverPhoto {
  /** @format int32 */
  id?: number;
  /** @format int32 */
  idBook?: number;
  /** @format uri */
  url?: string | null;
}

export interface User {
  /** @format int32 */
  id?: number;
  userName?: string | null;
  password?: string | null;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title FakeRESTApi.Web V1
 * @version v1
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags Activities
     * @name V1ActivitiesList
     * @request GET:/api/v1/Activities
     */
    v1ActivitiesList: (params: RequestParams = {}) =>
      this.request<Activity[], any>({
        path: `/api/v1/Activities`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Activities
     * @name V1ActivitiesCreate
     * @request POST:/api/v1/Activities
     */
    v1ActivitiesCreate: (data: Activity, params: RequestParams = {}) =>
      this.request<Activity, any>({
        path: `/api/v1/Activities`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Activities
     * @name V1ActivitiesDetail
     * @request GET:/api/v1/Activities/{id}
     */
    v1ActivitiesDetail: (id: number, params: RequestParams = {}) =>
      this.request<Activity, any>({
        path: `/api/v1/Activities/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Activities
     * @name V1ActivitiesUpdate
     * @request PUT:/api/v1/Activities/{id}
     */
    v1ActivitiesUpdate: (
      id: number,
      data: Activity,
      params: RequestParams = {},
    ) =>
      this.request<Activity, any>({
        path: `/api/v1/Activities/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Activities
     * @name V1ActivitiesDelete
     * @request DELETE:/api/v1/Activities/{id}
     */
    v1ActivitiesDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/Activities/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Authors
     * @name V1AuthorsList
     * @request GET:/api/v1/Authors
     */
    v1AuthorsList: (params: RequestParams = {}) =>
      this.request<Author[], any>({
        path: `/api/v1/Authors`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Authors
     * @name V1AuthorsCreate
     * @request POST:/api/v1/Authors
     */
    v1AuthorsCreate: (data: Author, params: RequestParams = {}) =>
      this.request<Author, any>({
        path: `/api/v1/Authors`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Authors
     * @name V1AuthorsAuthorsBooksDetail
     * @request GET:/api/v1/Authors/authors/books/{idBook}
     */
    v1AuthorsAuthorsBooksDetail: (idBook: number, params: RequestParams = {}) =>
      this.request<Author[], any>({
        path: `/api/v1/Authors/authors/books/${idBook}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Authors
     * @name V1AuthorsDetail
     * @request GET:/api/v1/Authors/{id}
     */
    v1AuthorsDetail: (id: number, params: RequestParams = {}) =>
      this.request<Author, any>({
        path: `/api/v1/Authors/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Authors
     * @name V1AuthorsUpdate
     * @request PUT:/api/v1/Authors/{id}
     */
    v1AuthorsUpdate: (id: number, data: Author, params: RequestParams = {}) =>
      this.request<Author, any>({
        path: `/api/v1/Authors/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Authors
     * @name V1AuthorsDelete
     * @request DELETE:/api/v1/Authors/{id}
     */
    v1AuthorsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/Authors/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Books
     * @name V1BooksList
     * @request GET:/api/v1/Books
     */
    v1BooksList: (params: RequestParams = {}) =>
      this.request<Book[], any>({
        path: `/api/v1/Books`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Books
     * @name V1BooksCreate
     * @request POST:/api/v1/Books
     */
    v1BooksCreate: (data: Book, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/Books`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Books
     * @name V1BooksDetail
     * @request GET:/api/v1/Books/{id}
     */
    v1BooksDetail: (id: number, params: RequestParams = {}) =>
      this.request<Book, any>({
        path: `/api/v1/Books/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Books
     * @name V1BooksUpdate
     * @request PUT:/api/v1/Books/{id}
     */
    v1BooksUpdate: (id: number, data: Book, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/Books/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Books
     * @name V1BooksDelete
     * @request DELETE:/api/v1/Books/{id}
     */
    v1BooksDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/Books/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CoverPhotos
     * @name V1CoverPhotosList
     * @request GET:/api/v1/CoverPhotos
     */
    v1CoverPhotosList: (params: RequestParams = {}) =>
      this.request<CoverPhoto[], any>({
        path: `/api/v1/CoverPhotos`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CoverPhotos
     * @name V1CoverPhotosCreate
     * @request POST:/api/v1/CoverPhotos
     */
    v1CoverPhotosCreate: (data: CoverPhoto, params: RequestParams = {}) =>
      this.request<CoverPhoto, any>({
        path: `/api/v1/CoverPhotos`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CoverPhotos
     * @name V1CoverPhotosBooksCoversDetail
     * @request GET:/api/v1/CoverPhotos/books/covers/{idBook}
     */
    v1CoverPhotosBooksCoversDetail: (
      idBook: number,
      params: RequestParams = {},
    ) =>
      this.request<CoverPhoto[], any>({
        path: `/api/v1/CoverPhotos/books/covers/${idBook}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CoverPhotos
     * @name V1CoverPhotosDetail
     * @request GET:/api/v1/CoverPhotos/{id}
     */
    v1CoverPhotosDetail: (id: number, params: RequestParams = {}) =>
      this.request<CoverPhoto, any>({
        path: `/api/v1/CoverPhotos/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CoverPhotos
     * @name V1CoverPhotosUpdate
     * @request PUT:/api/v1/CoverPhotos/{id}
     */
    v1CoverPhotosUpdate: (
      id: number,
      data: CoverPhoto,
      params: RequestParams = {},
    ) =>
      this.request<CoverPhoto, any>({
        path: `/api/v1/CoverPhotos/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CoverPhotos
     * @name V1CoverPhotosDelete
     * @request DELETE:/api/v1/CoverPhotos/{id}
     */
    v1CoverPhotosDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/CoverPhotos/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name V1UsersList
     * @request GET:/api/v1/Users
     */
    v1UsersList: (params: RequestParams = {}) =>
      this.request<User[], any>({
        path: `/api/v1/Users`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name V1UsersCreate
     * @request POST:/api/v1/Users
     */
    v1UsersCreate: (data: User, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/Users`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name V1UsersDetail
     * @request GET:/api/v1/Users/{id}
     */
    v1UsersDetail: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/Users/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name V1UsersUpdate
     * @request PUT:/api/v1/Users/{id}
     */
    v1UsersUpdate: (id: number, data: User, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/Users/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name V1UsersDelete
     * @request DELETE:/api/v1/Users/{id}
     */
    v1UsersDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/Users/${id}`,
        method: "DELETE",
        ...params,
      }),
  };
}
