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
  fileToUpload: File = null;
  userForm: FormGroup;
  loading = false;
  submitted = false;
  currentUser: User;
  currentUserSubscription: Subscription;

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
    this.userForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      profile: ['', [Validators.required]],
    });
  }

  // convenience getter for easy access to form fields
  get f(): any { return this.userForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    // stop here if form is invalid
    if (this.userForm.invalid) {
      return;
    }
    const userData = this.userForm.value;
    const formData = new FormData();

    formData.append('profile', this.fileToUpload, this.fileToUpload.name);
    formData.append('email', this.currentUser.email);
    formData.append('firstName', userData.firstName);
    formData.append('lastName', userData.lastName);
    formData.append('phone', userData.phone);

    this.loading = true;
    this.userService.updateUserProfile(formData)
      .pipe(first())
      .subscribe(
        () => {
          this.alertService.success('Profile Update successfully', true);
          this.loading = false;
          this.submitted = false;
          this.userForm.reset();
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        });
  }

  handleFileInput(files: FileList): void {
    this.fileToUpload = files.item(0);
  }

  ngOnDestroy(): void {
    // unsubscribe to ensure no memory leaks
    this.currentUserSubscription.unsubscribe();
  }
}
