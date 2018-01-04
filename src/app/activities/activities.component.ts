import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import { Activity } from '../shared/interfaces/Activity';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss']
})
export class ActivitiesComponent implements OnInit {

  public activities = [];

  activitiesCollection: AngularFirestoreCollection<Activity>;
  activitiesDoc: AngularFirestoreDocument<Activity>;

  activitiesList: Observable<Activity[]>;

  activitiesListSnapshot: any;
  itemList: Activity[];
  editItem: Activity;

  count = 10;

  constructor(public db: AngularFirestore,
    public authService: AuthService) { }

  ngOnInit() {
    this.activitiesCollection = this.db.collection('activities', ref => {
      return ref.orderBy('timestamp', 'desc');
      // return ref.orderBy('timestamp', 'desc').limit(100);
    });


    // this.activitiesCollection = this.db.collection('activities');

    // this.activitiesList = this.activitiesCollection.valueChanges();

    // this.getActivities();
    // this.getActivities2();
    // this.getActivities3();
    this.getActivities4();
  }




  // // ***  EXAMPLE #1 HOME MADE EXAMPLE
  // // Very bad flow of getting list of activities and then getting each signup from the key reference and converting that to data.

  // // Get User from ref
  // getUserFromRef(ref) {
  //   return new Promise((resolve, reject) => {
  //     ref
  //       .get()
  //       .then(result => {
  //         // Convert content
  //         const user = result.data();
  //         console.log('ActivitiesComponent: EXAMPLE #1: getUserFromRef: user: ', user);
  //         resolve(user);
  //       });
  //   });
  // }

  // // Handle Signups
  // convertSignups(item) {
  //   return new Promise((resolve, reject) => {

  //     const promises = [];
  //     // For each signup - get user from reference
  //     for (const key in item.signups) {
  //       if (!item.signups.hasOwnProperty(key)) {
  //         continue;
  //       }
  //       promises.push(this.getUserFromRef(item.signups[key]));
  //     }
  //     Observable.forkJoin(promises)
  //       .subscribe(results => {
  //         console.log('ActivitiesComponent: EXAMPLE #1: convertSignups: results: ', results);
  //         item.signups = results;
  //         resolve(item);
  //       });
  //   });
  // }

  // getActivities() {
  //   this.activities = [];

  //   this.db.collection('activities')
  //     .valueChanges()
  //     .subscribe(res => {
  //       console.log('ActivitiesComponent: EXAMPLE #1: activities: res: ', res);

  //       // For each Activity
  //       const promises = [];
  //       for (let i = 0; i < res.length; i++) {
  //         promises.push(this.convertSignups(res[i]));
  //       }
  //       Observable.forkJoin(promises)
  //         .subscribe(results => {
  //           console.log('ActivitiesComponent: EXAMPLE #1: results: ', results);
  //           this.activities = results;
  //           console.log('ActivitiesComponent: EXAMPLE #1: this.activities: ', this.activities);
  //         });
  //     });
  // }
  // ***  /EXAMPLE #1 HOME MADE EXAMPLE



  // *** EXAMPLE #2 STACKOVERFLOW EXAMPLE https://stackoverflow.com/questions/46568850/what-is-firestore-reference-data-type-good-for?noredirect=1&lq=1
  // getActivities2() {
  //   this.db.collection('activities')
  //     .snapshotChanges()
  //     .map(actions => {
  //       console.log('ActivitiesComponent: EXAMPLE #2: activities: actions: ', actions);
  //       return actions.map(a => {
  //         console.log('ActivitiesComponent: EXAMPLE #2: activities: a: ', a);
  //         const data = a.payload.doc.data();
  //         const id = a.payload.doc.id;

  //         if (data.signups) {
  //           console.log('ActivitiesComponent: EXAMPLE #2: activities: data.signups: ', data.signups);
  //           for (const key in data.signups) {
  //             if (!data.signups.hasOwnProperty(key)) {
  //               continue;
  //             }
  //             data.signups[key].get()
  //               .then(results => {
  //                 console.log('ActivitiesComponent: EXAMPLE #2: activities: data.signups exists: results: ', results);
  //                 data.signups[key] = results.data();
  //                 return { id, ...data };
  //               })
  //               .catch(err => console.error(err));
  //           }
  //         } else {
  //           return { id, ...data };
  //         }
  //       });
  //     })

  //     .subscribe(response => {
  //       console.log('ActivitiesComponent: EXAMPLE #2: activities: response: ', response);

  //     })
  // }



  // getActivities3() {

  //   // this.activitiesCollection = this.db.collection('activities', ref => {
  //   //   // return ref.orderBy('title', 'desc').limit(10);
  //   //   return ref.where('signupsCount', '>', 0).where('signupsCount', '<', 1000).limit(10);
  //   // });

  //   this.activitiesListSnapshot = this.activitiesCollection
  //     .snapshotChanges()
  //     .map(arr => {
  //       console.log('getActivities3: arr: ', arr);
  //       return arr.map(snap => {
  //         const obj = snap.payload.doc.data();
  //         obj.id = snap.payload.doc.id;

  //         console.log('getActivities3: obj: ', obj);
  //         return obj;
  //       });
  //     });
  // }


  getActivities4() {
    this.activitiesCollection
      .snapshotChanges()
      .map(arr => {
        // console.log('getActivities4: arr: ', arr);
        return arr.map(snap => {
          const obj = snap.payload.doc.data() as Activity;
          obj.id = snap.payload.doc.id;

          // const source = snap.payload.doc.metadata.fromCache ? 'local cache' : 'server';
          // console.log('getActivities4: Data came from ' + source);

          return obj;
        });
      })
      .subscribe(response => {
        console.log('getActivities4: subscribe: response: ', response);
        this.itemList = response;
      });
  }



  getItem(id) {
    this.activitiesDoc = this.activitiesCollection.doc(id);
    this.activitiesDoc
      .snapshotChanges()
      .map(snap => {
        if (snap.payload.exists) {
          const obj = snap.payload.data() as Activity;
          obj.id = snap.payload.id;

          console.log('getItem: obj: ', obj);
          const source = snap.payload.metadata.fromCache ? 'local cache' : 'server';
          console.log('getItem: Data came from ' + source);

          return obj;
        }
      })
      .subscribe(response => {
        this.editItem = response ? response : null;
        console.log('getItem: this.editItem: ', this.editItem);
      });
  }

  updateItem() {
    this.activitiesDoc = this.db.doc('activities/' + this.editItem.id);
    this.activitiesDoc.update({
      title: this.editItem.title,
      description: this.editItem.description,
      timestamp: new Date()
    })
      .then(() => {

      })
      .catch(err => console.error('error: ', err.message));
  }


  createItem() {
    this.authService.getUser().map(res => {

      console.log('createItem: getUser: res:', res);

      this.activitiesCollection.add({
        title: this.editItem.title,
        description: this.editItem.description,
        timestamp: this.editItem.timestamp
      })
        .then(res => {
          this.getItem(res.id);
        })
        .catch(err => console.error('error: ', err.message));

    });

  }


  deleteItem() {
    this.activitiesDoc = this.db.doc('activities/' + this.editItem.id);
    this.activitiesDoc.delete()
      .then(res => {
        this.clearItem();
      })
      .catch(err => console.error('error: ', err.message));
  }

  clearItem() {
    this.editItem = null;
  }

  newItem() {
    this.editItem = new Activity();
    console.log('newItem: editItem: ', this.editItem);
  }

  createMany(count) {
    for (let i = 0; i < count; i++) {
      const obj = new Activity();
      this.activitiesCollection.add({
        title: 'Auto Created #' + i,
        description: obj.description,
        timestamp: obj.timestamp
      })
        .catch(err => console.error('error: ', err.message));
    }
  }

  deleteAll() {

  }

}