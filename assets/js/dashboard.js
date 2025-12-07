// Dashboard that applies edits for all visitors by updating the GitHub repo file.
// Only the repo owner (with a PAT) can save changes; everyone else only views data.
(function () {
  const CONTENT_PATH = "assets/data/site-content.json";
  const REPO_OWNER = "ductienalpha";
  const REPO_NAME = "ductiendev";
  const BRANCH = "main";

  const selectors = {
    profileName: ".profile__name",
    profileTagline: ".profile_profession",
    statusTooltip: ".status_tooltip",
    counters: {
      projects: ".profile__info-group:nth-of-type(1) .counter",
      certificates: ".profile__info-group:nth-of-type(2) .counter",
      experience: ".profile__info-group:nth-of-type(3) .counter",
    },
    projects: ".projects__card",
  };

  const dashboardToggle = document.getElementById("dashboardToggle");
  const dashboardPanel = document.getElementById("dashboardPanel");
  const dashboardClose = document.getElementById("dashboardClose");
  const saveButton = document.getElementById("dashboardSubmit");

  if (!dashboardToggle || !dashboardPanel) return;

  dashboardToggle.title = "Nhấn để mở Dashboard (hoặc phím D).";

  const projectList = Array.from(document.querySelectorAll(selectors.projects)).map((card) => {
    const subtitle = card.querySelector(".projects__subtitle");
    const title = card.querySelector(".projects__title");
    const link = card.querySelector(".projects__button");
    const tags = Array.from(card.querySelectorAll(".projects__tag"));
    return { card, subtitle, title, link, tags };
  });

  const formElements = buildForm();
  let latestSha = null;

  fetchContent().then((content) => {
    applyStateToUI(content);
    populateForm(content);
  });

  dashboardToggle.addEventListener("click", toggleDashboard);

  dashboardClose?.addEventListener("click", closeDashboard);

  document.addEventListener("keydown", (event) => {
    if (event.key?.toLowerCase() === "d" && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      toggleDashboard();
    }
  });

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("dashboard") === "1") {
    openDashboard();
  }

  formElements.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const token = formElements.token?.value?.trim();
    if (!token) {
      alert("Bạn cần dán GitHub PAT của mình để lưu thay đổi (repo scope).");
      return;
    }

    const newState = readFormValues();
    saveButton.disabled = true;
    saveButton.textContent = "Đang lưu...";

    try {
      await pushContentToGitHub(token, newState);
      applyStateToUI(newState);
      alert("Đã cập nhật và đẩy lên GitHub. Tải lại trang để mọi người thấy thay đổi.");
      dashboardPanel.classList.remove("open");
    } catch (error) {
      console.error(error);
      alert("Không thể lưu thay đổi. Vui lòng kiểm tra PAT và thử lại.");
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = "Lưu thay đổi / Save changes";
    }
  });

  function toggleDashboard() {
    dashboardPanel.classList.toggle("open");
  }

  function openDashboard() {
    dashboardPanel.classList.add("open");
  }

  function closeDashboard() {
    dashboardPanel.classList.remove("open");
  }

  function buildForm() {
    const form = document.getElementById("dashboardForm");
    if (!form) return {};

    return {
      form,
      profileName: form.querySelector("#profileName"),
      profileTagline: form.querySelector("#profileTagline"),
      statusTooltip: form.querySelector("#statusText"),
      counters: {
        projects: form.querySelector("#counterProjects"),
        certificates: form.querySelector("#counterCertificates"),
        experience: form.querySelector("#counterExperience"),
      },
      projects: [
        createProjectFormGroup(form, 0),
        createProjectFormGroup(form, 1),
        createProjectFormGroup(form, 2),
      ],
      token: form.querySelector("#githubToken"),
    };
  }

  function createProjectFormGroup(form, index) {
    return {
      subtitle: form.querySelector(`#project${index + 1}Subtitle`),
      title: form.querySelector(`#project${index + 1}Title`),
      link: form.querySelector(`#project${index + 1}Link`),
      tags: form.querySelector(`#project${index + 1}Tags`),
    };
  }

  function applyStateToUI(state) {
    if (!state) return;
    updateProfileName(state.profileName);
    updateText(selectors.profileTagline, state.profileTagline);
    updateText(selectors.statusTooltip, state.statusText);
    updateCounter(selectors.counters.projects, state.counters.projects);
    updateCounter(selectors.counters.certificates, state.counters.certificates);
    updateCounter(selectors.counters.experience, state.counters.experience);
    updateProjects(state.projects);
  }

  function populateForm(state) {
    if (!formElements.form || !state) return;
    formElements.profileName.value = state.profileName;
    formElements.profileTagline.value = state.profileTagline;
    formElements.statusTooltip.value = state.statusText;
    formElements.counters.projects.value = state.counters.projects;
    formElements.counters.certificates.value = state.counters.certificates;
    formElements.counters.experience.value = state.counters.experience;
    formElements.projects.forEach((fields, index) => {
      const projectState = state.projects[index];
      if (!projectState) return;
      fields.subtitle.value = projectState.subtitle;
      fields.title.value = projectState.title;
      fields.link.value = projectState.link;
      fields.tags.value = projectState.tags.join(", ");
    });
  }

  function readFormValues() {
    return {
      profileName: formElements.profileName?.value?.trim() || "",
      profileTagline: formElements.profileTagline?.value?.trim() || "",
      statusText: formElements.statusTooltip?.value?.trim() || "",
      counters: {
        projects: parseInt(formElements.counters.projects?.value, 10) || 0,
        certificates: parseInt(formElements.counters.certificates?.value, 10) || 0,
        experience: parseInt(formElements.counters.experience?.value, 10) || 0,
      },
      projects: formElements.projects.map((fields) => ({
        subtitle: fields.subtitle?.value?.trim() || "",
        title: fields.title?.value?.trim() || "",
        link: fields.link?.value?.trim() || "",
        tags: (fields.tags?.value || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      })),
    };
  }

  function updateProfileName(name) {
    const element = document.querySelector(selectors.profileName);
    if (!element) return;
    const svg = element.querySelector("svg");
    const textNode = Array.from(element.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);

    if (textNode) {
      textNode.textContent = name + " ";
    } else {
      element.insertBefore(document.createTextNode(name + " "), element.firstChild);
    }

    if (svg) element.appendChild(svg);
  }

  function updateText(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
  }

  function updateCounter(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
  }

  function updateProjects(projectsState) {
    projectsState.forEach((project, index) => {
      const target = projectList[index];
      if (!target) return;
      target.subtitle && (target.subtitle.textContent = project.subtitle);
      target.title && (target.title.textContent = project.title);
      if (target.link) {
        target.link.setAttribute("href", project.link || "#");
      }
      if (target.tags?.length) {
        target.tags.forEach((tagElement, tagIndex) => {
          tagElement.textContent = project.tags[tagIndex] || "";
        });
      }
    });
  }

  async function fetchContent() {
    try {
      const response = await fetch(`${CONTENT_PATH}?v=${Date.now()}`);
      const json = await response.json();
      if (json?.sha) {
        latestSha = json.sha;
      }
      return json.data || json;
    } catch (error) {
      console.warn("Falling back to DOM defaults", error);
      return getDefaultState();
    }
  }

  async function pushContentToGitHub(token, state) {
    const contentResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${CONTENT_PATH}?ref=${BRANCH}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!contentResponse.ok) {
      throw new Error("Unable to fetch existing content");
    }

    const contentJson = await contentResponse.json();
    const sha = contentJson.sha || latestSha;
    latestSha = sha;

    const body = {
      message: "Update site content via dashboard",
      content: btoa(unescape(encodeURIComponent(JSON.stringify({ data: state, updatedAt: new Date().toISOString() }, null, 2)))),
      sha,
      branch: BRANCH,
    };

    const updateResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${CONTENT_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Update failed: ${errorText}`);
    }
  }

  function getDefaultState() {
    const nameElement = document.querySelector(selectors.profileName);
    const defaultName = nameElement?.childNodes?.[0]?.textContent?.trim() || "";
    const defaultTagline = document.querySelector(selectors.profileTagline)?.textContent?.trim() || "";
    const defaultStatus = document.querySelector(selectors.statusTooltip)?.textContent?.trim() || "";
    const defaultCounters = {
      projects: parseInt(document.querySelector(selectors.counters.projects)?.textContent || "0", 10),
      certificates: parseInt(document.querySelector(selectors.counters.certificates)?.textContent || "0", 10),
      experience: parseInt(document.querySelector(selectors.counters.experience)?.textContent || "0", 10),
    };
    const defaultProjects = projectList.map(({ subtitle, title, link, tags }) => ({
      subtitle: subtitle?.textContent?.trim() || "",
      title: title?.textContent?.trim() || "",
      link: link?.getAttribute("href") || "",
      tags: tags.map((tag) => tag.textContent.trim()),
    }));

    return {
      profileName: defaultName,
      profileTagline: defaultTagline,
      statusText: defaultStatus,
      counters: defaultCounters,
      projects: defaultProjects,
    };
  }
})();
