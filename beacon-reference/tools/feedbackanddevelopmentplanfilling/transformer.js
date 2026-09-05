(function (_data, args, reqOptions) {
  const iframe = document.querySelector("#ifrmPage");

  if (!iframe || !iframe.contentDocument) {
    return { success: false, message: "Iframe not found." };
  }

  const doc = iframe.contentDocument;
  let totalAppliedCount = 0;
  const results = {
    jobPreferences: 0,
    achievements: 0,
    developmentAreas: 0,
    overallComments: 0
  };

  const setText = (element, value) => {
    if (element && value && value !== '""' && value !== "Not Specified") {
      element.innerText = value;

      const parentEditor = element.closest('.longTextEditor');
      if (parentEditor) {
        const ckeIframe = parentEditor.querySelector('.cke_wysiwyg_frame');
        const textarea = parentEditor.querySelector('textarea');

        if (ckeIframe?.contentDocument?.body) {
          try {
            ckeIframe.contentDocument.body.innerHTML = `<p>${value}</p>`;
          } catch (e) {
          }
        }

        if (textarea && window.CKEDITOR && CKEDITOR.instances[textarea.id]) {
          try {
            const editorInstance = CKEDITOR.instances[textarea.id];
            editorInstance.setData(value);
            editorInstance.updateElement();
            editorInstance.fire('change');
          } catch (e) {
          }
        }
      }

      return true;
    }
    return false;
  };

  // ---- JOB PREFERENCES ----
  if (args.jobPreferencesSection && Array.isArray(args.jobPreferencesSection)) {
    const jobPreferencesContainer = doc.querySelector('#pnl_IntrerestedIns');
    if (jobPreferencesContainer) {
      const interestedInBlocks = jobPreferencesContainer.querySelectorAll('.perf-interested-in');
      args.jobPreferencesSection.forEach((item, index) => {
        if (index < interestedInBlocks.length) {
          const block = interestedInBlocks[index];
          if (setText(block.querySelector('[data-bind="html: Position"]'), item.position)) { results.jobPreferences++; totalAppliedCount++; }
          if (setText(block.querySelector('[data-bind="html: Location"]'), item.location)) { results.jobPreferences++; totalAppliedCount++; }
          if (setText(block.querySelector('[data-bind="html: Reason"]'), item.reason)) { results.jobPreferences++; totalAppliedCount++; }
          if (setText(block.querySelector('[data-bind="html: SupervisorComment"]'), item.assessorComment)) { results.jobPreferences++; totalAppliedCount++; }
          if (setText(block.querySelector('[data-bind="html: SecondSupervisorComment"]'), item.reviewerComment)) { results.jobPreferences++; totalAppliedCount++; }
        }
      });
    }
  }

  // ---- ACHIEVEMENTS ----
  if (args.achievementBlocks && Array.isArray(args.achievementBlocks)) {
    const achievementBlocks = doc.querySelectorAll('.perf-achievement');
    args.achievementBlocks.forEach((item, index) => {
      if (index < achievementBlocks.length) {
        const block = achievementBlocks[index];
        if (setText(block.querySelector('[data-bind="html: Achievement"]'), item.achievement)) { results.achievements++; totalAppliedCount++; }
        if (setText(block.querySelector('[data-bind="html: Learning"]'), item.learning)) { results.achievements++; totalAppliedCount++; }
        if (setText(block.querySelector('[data-bind="html: Strengths"]'), item.strengths)) { results.achievements++; totalAppliedCount++; }
        if (setText(block.querySelector('[data-bind="html: SecondSupervisorComment"]'), item.reviewerComment)) { results.achievements++; totalAppliedCount++; }
      }
    });
  }

  // ---- DEVELOPMENT AREAS ----
  if (args.developmentArea && Array.isArray(args.developmentArea)) {
    const missBlocks = doc.querySelectorAll('.perf-miss');
    args.developmentArea.forEach((item, index) => {
      if (index < missBlocks.length) {
        const block = missBlocks[index];
        if (setText(block.querySelector('[data-bind="html: Miss"]'), item.developmentArea)) { results.developmentAreas++; totalAppliedCount++; }
        if (setText(block.querySelector('[data-bind="html: Learning"]'), item.learning)) { results.developmentAreas++; totalAppliedCount++; }
        if (setText(block.querySelector('[data-bind="html: DevArea"]'), item.suggestions)) { results.developmentAreas++; totalAppliedCount++; }
        if (setText(block.querySelector('[data-bind="html: SecondSupervisorComment"]'), item.reviewerComment)) { results.developmentAreas++; totalAppliedCount++; }
      }
    });
  }

  // ---- OVERALL COMMENTS ----
  if (args.overallCommentsSection && Array.isArray(args.overallCommentsSection)) {
    const overallCommentsContainer = doc.querySelector('#perfv8-feedback-partial-overallcomment-6');
    if (overallCommentsContainer) {
      const commentBlocks = overallCommentsContainer.querySelectorAll('.perf-interested-in');
      args.overallCommentsSection.forEach((item, index) => {
        if (index < commentBlocks.length) {
          const block = commentBlocks[index];
          if (setText(block.querySelector('[data-bind="html: Comment"]'), item.comment)) { results.overallComments++; totalAppliedCount++; }
          if (setText(block.querySelector('[data-bind="html: Comment"]'), item.reviewerComment)) { results.overallComments++; totalAppliedCount++; }
        }
      });
    }
  }

  // ---- GLOBAL CKEDITOR SYNC ----
  if (iframe.contentWindow?.CKEDITOR) {
    try {
      const iframeCKE = iframe.contentWindow.CKEDITOR.instances;
      for (const name in iframeCKE) {
        const instance = iframeCKE[name];
        instance.updateElement();
        instance.fire('change');
      }
    } catch (e) {
    }
  }

  return {
    success: true,
    totalAppliedCount,
    sectionResults: results,
    message: `Successfully applied ${totalAppliedCount} field updates across all sections.`,
    details: {
      jobPreferences: `${results.jobPreferences} fields updated`,
      achievements: `${results.achievements} fields updated`,
      developmentAreas: `${results.developmentAreas} fields updated`,
      overallComments: `${results.overallComments} fields updated`
    }
  };
});
