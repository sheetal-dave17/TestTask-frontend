import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../auth/authentication.service';
import { UserService } from '../user.service';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { User } from '../interfaces/user';
import { AlertService } from '../alert.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  loading = false;
  currentUser: User;
  currentUserSubscription: Subscription;
  user: User;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private alertService: AlertService
  ) {
    this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.userService.getUserData(this.currentUser.email)
      .pipe(first())
      .subscribe(
        (user) => {
          this.loading = false;
          this.user = user;
          this.alertService.clear();
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        });
  }

  ngOnDestroy(): void {
    // unsubscribe to ensure no memory leaks
    this.currentUserSubscription.unsubscribe();
  }

}
