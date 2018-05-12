// tslint:disable
// graphql typescript definitions

declare namespace GQL {
interface IGraphQLResponseRoot {
data?: IQuery | IMutation;
errors?: Array<IGraphQLResponseError>;
}

interface IGraphQLResponseError {
/** Required for all errors */
message: string;
locations?: Array<IGraphQLResponseErrorLocation>;
/** 7.2.2 says 'GraphQL servers may provide additional entries to error' */
[propName: string]: any;
}

interface IGraphQLResponseErrorLocation {
line: number;
column: number;
}

interface IQuery {
__typename: "Query";
getAllBooks: Array<IBook>;
hello: string | null;
me: IUser | null;
getAllUsers: Array<IUser>;
}

interface IBook {
__typename: "Book";
id: string;
title: string;
author: string;
createdAt: any;
}

interface IUser {
__typename: "User";
id: string;
firstName: string;
lastName: string;
email: string;
password: string;
registeredAt: any;
confirmed: boolean;
}

interface IMutation {
__typename: "Mutation";
addBook: IResponse;
deleteBook: IResponse;
updateBook: IResponse;
login: Array<IResponse>;
register: Array<IResponse>;
deleteUser: IResponse;
}

interface IAddBookOnMutationArguments {
title: string;
author: string;
}

interface IDeleteBookOnMutationArguments {
id: string;
}

interface IUpdateBookOnMutationArguments {
id: string;
title?: string | null;
author?: string | null;
}

interface ILoginOnMutationArguments {
email: string;
password: string;
}

interface IRegisterOnMutationArguments {
firstName: string;
lastName: string;
email: string;
password: string;
}

interface IDeleteUserOnMutationArguments {
id: string;
}

interface IResponse {
__typename: "Response";
ok: string;
path: string | null;
message: string;
token: string | null;
refreshToken: string | null;
}
}

// tslint:enable
