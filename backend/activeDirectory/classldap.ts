import ActiveDirectory from 'activedirectory2';
import fs from 'fs';

interface ActiveDirectoryUser {
    sAMAccountName?: string;
    mail?: string;
    cn?: string;
    department?: string;
    telephoneNumber?: string;
    company?: string;
    manager?: string;
    description?: string;
    title?: string;
    info?: string;
}

interface DirectoryUser {
    user: string;
    email: string;
    fullname: string;
    sector: string;
    telephoneNumber: string;
    company: string;
    manager?: string;
    sigla_sector: string;
    title: string;
    dtnasc: string;
}

export default class {

    private ad: ActiveDirectory;

    constructor(username: string, password: string, url: string, basedn: string, port: number) {

        const caCertPath = '/usr/local/share/ca-certificates/samba-ca.crt';

        const config = {
            url: ((port == 636) ? 'ldaps://' : 'ldap://') + url + ":" + port,
            baseDN: basedn,
            username: username,
            password: password,
            tlsOptions: {
                ca: fs.existsSync(caCertPath) ? [fs.readFileSync(caCertPath)] : [],
                rejectUnauthorized: false
            },
            starttls: true,
            attributes: {
                user: [
                    'dn',
                    'cn',
                    'userPrincipalName',
                    'sAMAccountName',
                    'info',
                    'mail',
                    'displayName',
                    'givenName',
                    'sn',
                    'telephoneNumber',
                    'mobile',
                    'title',
                    'department',
                    'company',
                    'manager',
                    'streetAddress',
                    'l',
                    'st',
                    'postalCode',
                    'description',
                    'distinguishedName'
                ]
            },
            connectTimeout: 8000
        };

        this.ad = new ActiveDirectory(config as unknown as ConstructorParameters<typeof ActiveDirectory>[0]);
    }

    Autenticate(username: string, password: string): Promise<boolean> {

        return new Promise<boolean>((resolve, reject) => {

            this.ad.authenticate(username, password, function (err: string, auth: boolean) {

                if (err) {
                    reject(err);
                    return;
                }

                if (auth) {
                    resolve(true);
                }
                else {
                    reject(false);
                }

            });

        });

    }

    FindUser(username: string): Promise<DirectoryUser> {

        return new Promise<DirectoryUser>((resolve, reject) => {

            this.ad.findUser(username, function (err: object, user: object) {

                if (err) {
                    reject(err);
                    return;
                }

                const directoryUser = user as ActiveDirectoryUser;

                resolve({
                    user: directoryUser.sAMAccountName?.toLowerCase() || '',
                    email: directoryUser.mail || '',
                    fullname: directoryUser.cn || '',
                    sector: directoryUser.department || '',
                    telephoneNumber: directoryUser.telephoneNumber || '',
                    company: directoryUser.company || '',
                    manager: directoryUser.manager && directoryUser.manager.split('CN=')[1].split(',')[0],
                    sigla_sector: directoryUser.description || '',
                    title: directoryUser.title || '',
                    dtnasc: directoryUser.info || ''
                });

            });

        });

    }

    GetGroupsForUser(sAMAccountName: string): Promise<object[]> {

        return new Promise<object[]>((resolve, reject) => {

            this.ad.getGroupMembershipForUser(sAMAccountName, (err: object, groups: object[]) => {

                if (err) {

                    reject(err);
                    return;
                }

                resolve(groups);
            });

        });
    }
}
