/*
 * Squidex Headless CMS
 *
 * @license
 * Copyright (c) Squidex UG (haftungsbeschränkt). All rights reserved.
 */

import { Observable } from 'rxjs';
import { IMock, Mock, Times } from 'typemoq';

import {
    AuthService,
    Profile,
    PublicUserDto,
    UsersProviderService,
    UsersService
} from './../';

describe('UsersProviderService', () => {
    let authService: IMock<AuthService>;
    let usersService: IMock<UsersService>;
    let usersProviderService: UsersProviderService;

    beforeEach(() => {
        authService = Mock.ofType(AuthService);
        usersService = Mock.ofType(UsersService);
        usersProviderService = new UsersProviderService(usersService.object, authService.object);
    });

    it('should return users service when user not cached', () => {
        const user = new PublicUserDto('123', 'User1');

        usersService.setup(x => x.getUser('123'))
            .returns(() => Observable.of(user)).verifiable(Times.once());

        let resultingUser: PublicUserDto | null = null;

        usersProviderService.getUser('123').subscribe(result => {
            resultingUser = result;
        }).unsubscribe();

        expect(resultingUser).toBe(user);

        usersService.verifyAll();
    });

    it('should return provide user from cache', () => {
        const user = new PublicUserDto('123', 'User1');

        usersService.setup(x => x.getUser('123'))
            .returns(() => Observable.of(user)).verifiable(Times.once());

        usersProviderService.getUser('123');

        let resultingUser: PublicUserDto | null = null;

        usersProviderService.getUser('123').subscribe(result => {
            resultingUser = result;
        }).unsubscribe();

        expect(resultingUser).toBe(user);

        usersService.verifyAll();
    });

    it('should return me when user is current user', () => {
        const user = new PublicUserDto('123', 'User1');

        authService.setup(x => x.user)
            .returns(() => new Profile(<any>{ profile: { sub: '123'}}));

        usersService.setup(x => x.getUser('123'))
            .returns(() => Observable.of(user)).verifiable(Times.once());

        let resultingUser: PublicUserDto | null = null;

        usersProviderService.getUser('123').subscribe(result => {
            resultingUser = result;
        }).unsubscribe();

        expect(resultingUser).toEqual(new PublicUserDto('123', 'Me'));

        usersService.verifyAll();
    });

    it('should return invalid user when not found', () => {
        authService.setup(x => x.user)
            .returns(() => new Profile(<any>{ profile: { sub: '123'}}));

        usersService.setup(x => x.getUser('123'))
            .returns(() => Observable.throw('NOT FOUND')).verifiable(Times.once());

        let resultingUser: PublicUserDto | null = null;

        usersProviderService.getUser('123').subscribe(result => {
            resultingUser = result;
        }).unsubscribe();

        expect(resultingUser).toEqual(new PublicUserDto('Unknown', 'Unknown'));

        usersService.verifyAll();
    });
});