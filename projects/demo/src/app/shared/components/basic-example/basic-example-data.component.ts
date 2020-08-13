import { Component } from '@angular/core';

@Component({
  selector: 'basic-example-data',
  template: `
    <ng2-smart-table [settings]="settings" [source]="data" (onColumnOrderChanged)="test($event)"></ng2-smart-table>
  `,
})
export class BasicExampleDataComponent {

  settings = {
    columns: {
      id: {
        title: 'ID',
			},
      name: {
        title: 'Full Name',
			},
      username: {
        title: 'User Name',
			},
      email: {
        title: 'Email',
			},
      deleted: {
        title: 'Deleted',
			},
      created_at:{
        title: 'Create on',
			}
    },
  };

  data = [
    {
      id: 1,
      name: 'Leanne Graham',
      username: 'Bret',
      email: 'Sincere@april.biz',
      deleted: false,
      created_at: Math.floor(Date.now() / 1000),
    },
    {
      id: 2,
      name: 'Ervin Howell',
      username: 'Antonette',
      email: 'Shanna@melissa.tv',
      deleted: false,
      created_at: Math.floor(Date.now() / 1000),
    },
    {
      id: 3,
      name: 'Clementine Bauch',
      username: 'Samantha',
      email: 'Nathan@yesenia.net',
      deleted: false,
      created_at: Math.floor(Date.now() / 1000),
    },
    {
      id: 4,
      name: 'Patricia Lebsack',
      username: 'Karianne',
      email: 'Julianne.OConner@kory.org',
      deleted: false,
      created_at: Math.floor(Date.now() / 1000),
    },
    {
      id: 5,
      name: 'Chelsey Dietrich',
      username: 'Kamren',
      email: 'Lucio_Hettinger@annie.ca',
      deleted: false,
      created_at: Math.floor(Date.now() / 1000),
    },
    {
      id: 6,
      name: 'Mrs. Dennis Schulist',
      username: 'Leopoldo_Corkery',
      email: 'Karley_Dach@jasper.info',
      deleted: false,
      created_at: Math.floor(Date.now() / 1000),
		},
    {
      id: 7,
      name: 'Kurtis Weissnat',
      username: 'Elwyn.Skiles',
      email: 'Telly.Hoeger@billy.biz',
      deleted: false,
      created_at: Math.floor(Date.now() / 1000),
		},
    {
      id: 8,
      name: 'Nicholas Runolfsdottir V',
      username: 'Maxime_Nienow',
      email: 'Sherwood@rosamond.me',
      deleted: false,
      created_at: Math.floor(Date.now() / 1000),
    },
    {
      id: 9,
      name: 'Glenna Reichert',
      username: 'Delphine',
      email: 'Chaim_McDermott@dana.io',
      deleted: false,
      created_at: Math.floor(Date.now() / 1000),
    },
    {
      id: 10,
      name: 'Clementina DuBuque',
      username: 'Moriah.Stanton',
      email: 'Rey.Padberg@karina.biz',
      deleted: false,
      created_at: Math.floor(Date.now() / 1000),
    },
    {
      id: 11,
      name: 'Nicholas DuBuque',
      username: 'Nicholas.Stanton',
      email: 'Rey.Padberg@rosamond.biz',
      deleted: false,
      created_at: Math.floor(Date.now() / 1000),
    },
  ];

  test(event: any)
	{
		console.log(event);
	}
}
