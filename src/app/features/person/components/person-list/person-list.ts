import { Component, OnInit, inject } from "@angular/core";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTooltipModule } from "@angular/material/tooltip";
import { DatePipe } from "@angular/common";
import { PersonStore } from "../../services/person-store";
import { PersonCreateModal } from "../person-create-modal/person-create-modal";
import { PersonEditModal } from "../person-edit-modal/person-edit-modal";
import { Person } from "../../../../shared/models/person.model";

@Component({
  selector: "app-person-list",
  templateUrl: "./person-list.html",
  styleUrl: "./person-list.scss",
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    DatePipe,
  ],
})
export class PersonList implements OnInit {
  private readonly router = inject(Router);
  readonly personStore = inject(PersonStore);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = [
    "name",
    "email",
    "phone",
    "city",
    "country",
    "actions",
  ];

  ngOnInit(): void {
    this.personStore.loadPersons();
  }

  openCreatePersonModal(): void {
    const dialogRef = this.dialog.open(PersonCreateModal, {
      width: "600px",
      maxWidth: "90vw",
      disableClose: false,
      autoFocus: true,
      panelClass: "person-modal",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Person is created in the modal via store
      }
    });
  }

  openEditPersonModal(person: Person): void {
    const dialogRef = this.dialog.open(PersonEditModal, {
      width: "600px",
      maxWidth: "90vw",
      disableClose: false,
      autoFocus: true,
      panelClass: "person-modal",
      data: person,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Person is updated in the modal via store
      }
    });
  }

  deletePerson(person: Person): void {
    if (
      confirm(
        `Are you sure you want to delete "${person.firstName} ${person.lastName}"?`,
      )
    ) {
      this.personStore.deletePerson(person.id);
    }
  }

  getFullName(person: Person): string {
    return `${person.firstName} ${person.lastName}`;
  }

  goToDashboard(): void {
    this.router.navigate(["/dashboard"]);
  }
}
