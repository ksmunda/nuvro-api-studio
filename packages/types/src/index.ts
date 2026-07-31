export type {
  Pagination,
  SortDirection,
  ApiError,
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UserProfile,
  AuthTokens,
  LoginResponse,
  WorkspaceRole,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
  WorkspaceMember,
  Workspace,
  WorkspaceDetail,
  FolderDto,
  CreateCollectionInput,
  UpdateCollectionInput,
  CreateFolderInput,
  UpdateFolderInput,
  Collection,
  CollectionDetail,
  HttpMethod,
  AuthType,
  BodyType,
  ApiKeyLocation,
  KeyValuePair,
  AuthConfig,
  BasicAuthConfig,
  BearerAuthConfig,
  ApiKeyAuthConfig,
  OAuth2AuthConfig,
  GraphqlBody,
  CreateApiRequestInput,
  UpdateApiRequestInput,
  ExecuteRequestInput,
  ApiRequest,
  ExecuteResponse,
  CreateEnvironmentInput,
  UpdateEnvironmentInput,
  CreateVariableInput,
  UpdateVariableInput,
  BulkUpsertVariablesInput,
  Variable,
  Environment,
  EnvironmentDetail,
  ResolvedEnvironment,
  RequestStatus,
  HistoryQuery,
  RequestHistoryItem,
} from '@nuvro/validation';

export type RequestEditorTab = 'params' | 'headers' | 'body' | 'auth' | 'scripts' | 'settings';
export type ResponseViewerTab = 'body' | 'headers' | 'cookies' | 'timeline';
export type SidebarPanel = 'collections' | 'environments' | 'history' | 'settings';
export type ThemePreference = 'light' | 'dark' | 'system';
export type NotificationSeverity = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  severity: NotificationSeverity;
  title: string;
  message?: string;
  durationMs?: number;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
