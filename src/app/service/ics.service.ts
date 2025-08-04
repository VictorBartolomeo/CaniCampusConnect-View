import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IcsService {

  /**
   * ✅ Génère et télécharge un fichier ICS pour un cours
   */
  downloadCourseICS(course: any, dogName?: string): void {
    const icsContent = this.generateCourseICS(course, dogName);
    this.downloadFile(icsContent, `cours-${this.sanitizeFilename(course.title)}.ics`);
  }

  /**
   * ✅ Génère le contenu ICS d'un cours
   */
  private generateCourseICS(course: any, dogName?: string): string {
    const startDate = new Date(course.startDatetime);
    const endDate = new Date(course.endDatetime);

    // Format des dates pour ICS (YYYYMMDDTHHMMSSZ)
    const formatICSDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const now = new Date();
    const uid = `course-${course.id}-${now.getTime()}@canicampusconnect.com`;

    const summary = dogName ?
      `${course.title} - ${dogName}` :
      course.title;

    const description = this.formatDescription(course, dogName);
    const location = course.location || 'Club Canin CaniCampusConnect';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CaniCampusConnect//Cours Canin//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `DTSTAMP:${formatICSDate(now)}`,
      `SUMMARY:${this.escapeICSText(summary)}`,
      `DESCRIPTION:${this.escapeICSText(description)}`,
      `LOCATION:${this.escapeICSText(location)}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'CATEGORIES:COURS,CHIEN,EDUCATION',
      // Rappel 30 minutes avant
      'BEGIN:VALARM',
      'TRIGGER:-PT30M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Cours de chien dans 30 minutes',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
  }

  /**
   * ✅ Formate la description du cours
   */
  private formatDescription(course: any, dogName?: string): string {
    const parts = [];

    if (dogName) {
      parts.push(`Chien inscrit: ${dogName}`);
    }

    if (course.description) {
      parts.push(`Description: ${course.description}`);
    }

    if (course.coach) {
      const coachName = `${course.coach.firstname || ''} ${course.coach.lastname || ''}`.trim();
      if (coachName) {
        parts.push(`Coach: ${coachName}`);
      }
    }

    if (course.courseType) {
      parts.push(`Type: ${course.courseType.name}`);
    }

    if (course.maxCapacity) {
      parts.push(`Capacité: ${course.registrationCount || 0}/${course.maxCapacity} participants`);
    }

    parts.push('\\nGénéré par CaniCampusConnect');

    return parts.join('\\n');
  }

  /**
   * ✅ Échappe le texte pour le format ICS
   */
  private escapeICSText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  }

  /**
   * ✅ Nettoie le nom de fichier
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9\-_]/gi, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase();
  }

  /**
   * ✅ Télécharge un fichier
   */
  private downloadFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Libérer la mémoire
    window.URL.revokeObjectURL(url);
  }

  /**
   * ✅ Génère et télécharge un fichier ICS pour plusieurs cours
   */
  downloadMultipleCoursesICS(courses: any[], dogName?: string): void {
    if (!courses || courses.length === 0) {
      return;
    }

    const icsContent = this.generateMultipleCoursesICS(courses, dogName);
    const filename = dogName ?
      `cours-${this.sanitizeFilename(dogName)}.ics` :
      'mes-cours-canins.ics';

    this.downloadFile(icsContent, filename);
  }

  /**
   * ✅ Génère le contenu ICS pour plusieurs cours
   */
  private generateMultipleCoursesICS(courses: any[], dogName?: string): string {
    const now = new Date();
    const formatICSDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const header = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CaniCampusConnect//Cours Canin//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    const events = courses.map(course => {
      const startDate = new Date(course.startDatetime);
      const endDate = new Date(course.endDatetime);
      const uid = `course-${course.id}-${now.getTime()}@canicampusconnect.com`;

      const summary = dogName ?
        `${course.title} - ${dogName}` :
        course.title;

      const description = this.formatDescription(course, dogName);
      const location = course.location || 'Club Canin CaniCampusConnect';

      return [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `DTSTAMP:${formatICSDate(now)}`,
        `SUMMARY:${this.escapeICSText(summary)}`,
        `DESCRIPTION:${this.escapeICSText(description)}`,
        `LOCATION:${this.escapeICSText(location)}`,
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'CATEGORIES:COURS,CHIEN,EDUCATION',
        'BEGIN:VALARM',
        'TRIGGER:-PT30M',
        'ACTION:DISPLAY',
        'DESCRIPTION:Cours de chien dans 30 minutes',
        'END:VALARM',
        'END:VEVENT'
      ].join('\r\n');
    });

    const footer = ['END:VCALENDAR'];

    return [...header, ...events, ...footer].join('\r\n');
  }
}
