package com.example.demo.repository;

import com.example.demo.model.Parent;
import com.example.demo.model.Racer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RacerRepository extends JpaRepository<Racer, Long> {

    // ==========================================================
    // Parent dashboard (owned + co-parent racers)
    // ==========================================================
    @Query("""
        SELECT DISTINCT r
        FROM Racer r
        WHERE r.parent.id = :parentId
           OR r.id IN (
                SELECT prl.racer.id
                FROM ParentRacerLink prl
                WHERE prl.parent.id = :parentId
           )
        """)
    List<Racer> findAllVisibleToParent(@Param("parentId") Long parentId);

    default List<Racer> findAllVisibleToParent(Parent parent) {
        return findAllVisibleToParent(parent.getId());
    }

    // ==========================================================
    // Duplicate checks (per parent)
    // Rule: block duplicates for same parent on (first+last+age+nickname)
    // Nickname is never null (stored as ""), so these comparisons are consistent.
    // ==========================================================
    boolean existsByParentIdAndFirstNameIgnoreCaseAndLastNameIgnoreCaseAndAgeAndNicknameIgnoreCase(
            Long parentId,
            String firstName,
            String lastName,
            int age,
            String nickname
    );

    boolean existsByParentIdAndFirstNameIgnoreCaseAndLastNameIgnoreCaseAndAgeAndNicknameIgnoreCaseAndIdNot(
            Long parentId,
            String firstName,
            String lastName,
            int age,
            String nickname,
            Long id
    );

    // ==========================================================
    // Admin search
    // ==========================================================
    @Query("""
       select distinct r
       from Racer r
       left join ParentRacerLink l on l.racer = r
       where
         (r.parent is not null or l.parent is not null)
         and (
             lower(r.firstName) like lower(concat('%', :q, '%'))
          or lower(r.lastName) like lower(concat('%', :q, '%'))
          or lower(r.carNumber) like lower(concat('%', :q, '%'))
          or lower(r.nickname) like lower(concat('%', :q, '%'))
         )
       """)
    List<Racer> searchAdminRacers(@Param("q") String q);
}