import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ConfirmDialogComponent } from './confirm-dialog.component';

/**
 * Unit tests for ConfirmDialogComponent
 *
 * Tests visibility toggling, confirmed/cancelled event emission.
**/

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
  });

  describe('visibility', () => {
    it('should render the dialog when visible is true', () => {
      component.visible = true;
      component.title = 'Delete Quiz';
      component.message = 'Are you sure?';
      fixture.detectChanges();

      const overlay = fixture.nativeElement.querySelector('.dialog-overlay');
      expect(overlay).not.toBeNull();

      const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
      expect(dialog).not.toBeNull();
    });

    it('should not render the dialog when visible is false', () => {
      component.visible = false;
      fixture.detectChanges();

      const overlay = fixture.nativeElement.querySelector('.dialog-overlay');
      expect(overlay).toBeNull();

      const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
      expect(dialog).toBeNull();
    });

    it('should display the provided title and message', () => {
      component.visible = true;
      component.title = 'Confirm Deletion';
      component.message = 'This action cannot be undone.';
      fixture.detectChanges();

      const title = fixture.nativeElement.querySelector('.dialog-title');
      expect(title.textContent).toContain('Confirm Deletion');

      const message = fixture.nativeElement.querySelector('.dialog-message');
      expect(message.textContent).toContain('This action cannot be undone.');
    });
  });

  describe('confirmed event', () => {
    it('should emit confirmed when the confirm button is clicked', () => {
      component.visible = true;
      fixture.detectChanges();

      let emitted = false;
      component.confirmed.subscribe(() => {
        emitted = true;
      });

      const confirmButton = fixture.nativeElement.querySelector('.dialog-button--confirm');
      confirmButton.click();

      expect(emitted).toBe(true);
    });
  });

  describe('cancelled event', () => {
    it('should emit cancelled when the cancel button is clicked', () => {
      component.visible = true;
      fixture.detectChanges();

      let emitted = false;
      component.cancelled.subscribe(() => {
        emitted = true;
      });

      const cancelButton = fixture.nativeElement.querySelector('.dialog-button--cancel');
      cancelButton.click();

      expect(emitted).toBe(true);
    });

    it('should emit cancelled when the overlay is clicked', () => {
      component.visible = true;
      fixture.detectChanges();

      let emitted = false;
      component.cancelled.subscribe(() => {
        emitted = true;
      });

      const overlay = fixture.nativeElement.querySelector('.dialog-overlay');
      overlay.click();

      expect(emitted).toBe(true);
    });
  });
});
