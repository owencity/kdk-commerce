# 개발 환경

Java로 주문 코드를 직접 작성하기 위한 Spring Boot 실행 환경이다. 주문 기능과 DB 연결은 아직 구현하지 않았다.

## 구성

| 항목 | 버전·용도 |
| --- | --- |
| Java | 21. 현재 PC의 Temurin 21.0.10으로 확인했다. |
| Spring Boot | 4.2.0 |
| Gradle | 9.9.2. 저장소의 Gradle Wrapper로 실행한다. |
| Spring Web MVC | HTTP 요청·응답 처리 |
| Actuator | 서버 기동 상태 확인 |
| 테스트 | Spring Boot가 관리하는 JUnit Jupiter |

`build.gradle.kts`는 Gradle 빌드 설정이다. 설정 파일에 Kotlin 문법을 사용하지만 애플리케이션 코드는 Java로 작성한다. Gradle을 PC에 따로 설치할 필요는 없다. 첫 실행에는 Gradle과 의존성 다운로드를 위한 인터넷 연결이 필요하다.

## 실행

프로젝트 폴더에서 PowerShell을 연다.

```powershell
cd D:\dev\kdkmall
java -version
.\gradlew.bat test
.\gradlew.bat bootRun
```

서버를 실행한 상태에서 [기동 상태 확인](http://127.0.0.1:18090/actuator/health)을 연다. HTTP 응답이 `200`이고 JSON 본문의 `status`가 `UP`이면 기동 확인에 성공한 것이다. 종료는 실행한 터미널에서 `Ctrl+C`를 누른다.

현재 서버는 `127.0.0.1`로 접속하며 다른 PC에서는 직접 접근할 수 없다. `/`와 주문 API는 아직 만들지 않았으므로 해당 주소의 `404` 응답은 정상이다. 현재 PC에서 8080·18080 포트가 사용 중이어서 기본 포트는 18090으로 정했다. 18090도 사용 중이면 다음처럼 실행한다.

```powershell
.\gradlew.bat bootRun --args="--server.port=18091"
```

이때 기동 확인 주소도 `http://127.0.0.1:18091/actuator/health`로 바꾼다.

## IDE에서 열기

IntelliJ IDEA를 사용한다면 프로젝트 폴더를 열고 Gradle 프로젝트를 불러온다. Project SDK와 Gradle JVM을 JDK 21로 설정하고, Gradle은 저장소의 Wrapper를 사용한다. 설치된 JDK가 보이지 않으면 현재 PC의 `C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot`을 선택한다.

시작 클래스는 `src/main/java/io/github/owencity/commerce/KdkCommerceApplication.java`다. 기본 테스트는 `src/test/java/io/github/owencity/commerce/KdkCommerceApplicationTests.java`에 있다. 기본 테스트는 Spring 설정이 로드되는지만 확인하며 주문 로직을 검증하지 않는다.

## 첫 구현까지의 순서

1. 서버와 기본 테스트를 직접 실행해 본다.
2. 첫 주문 기능의 입력, 성공 결과, 거절 조건을 요구사항에서 확인한다. 미정 조건은 구현 전에 정한다.
3. 사용자가 처리 순서, 필요한 데이터와 메서드를 작성한다. 클래스 목록은 미리 정답으로 제공하지 않는다.
4. 사용자가 구현하고 실행 결과를 예상한 뒤, 테스트와 디버거로 확인한다. 에이전트는 요청받은 부분의 설명·힌트·코드 리뷰를 맡는다.

## 확인 기록

2026-11-23에 공식 Spring Initializr에서 Java 21·Spring Boot 4.2.0·Gradle Kotlin DSL과 Web·Actuator를 선택해 생성했다. Gradle Wrapper JAR의 SHA-256을 공식 값과 대조했고, Gradle 배포 파일의 SHA-256도 Wrapper 설정에 고정했다.

| 확인 항목 | 결과 |
| --- | --- |
| 기본 테스트 | `contextLoads` 1개 통과. 주문 로직 테스트는 아니다. |
| 실행 파일 생성 | `bootJar` 성공. `build/libs/kdk-commerce-0.0.1-SNAPSHOT.jar` 생성. |
| 서버 기동 | `bootRun`으로 `127.0.0.1:18090` 기동 성공. |
| 기동 확인 요청 | `/actuator/health`: HTTP 200, `status: UP`. |
| 미구현 경로 | `/`: HTTP 404. |

8080·18080 포트로 실행했을 때는 기존 프로그램과 충돌했다. 18090 포트의 사용 가능 여부를 확인한 뒤 설정을 바꾸고 기동했다. 설정·기동 확인만 수행했으며 주문·DB·동시성 동작은 아직 검증하지 않았다.

## 공식 자료

모두 2026-11-23 확인. 발행일은 별도 표기되어 있지 않다.

- [Spring Initializr](https://start.spring.io/): 기본 프로젝트 생성.
- [Spring Boot 시스템 요구사항](https://docs.spring.io/spring-boot/system-requirements.html): 확인 당시 4.2.0의 Java·Gradle 지원 범위.
- [Gradle 9.9.2 호환 표](https://docs.gradle.org/9.9.2/userguide/compatibility.html): Java 21 지원.
- [Gradle Wrapper](https://docs.gradle.org/9.9.2/userguide/gradle_wrapper.html): 버전 고정과 배포 파일 검증.
- [Spring Boot Actuator](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html): health 엔드포인트.
